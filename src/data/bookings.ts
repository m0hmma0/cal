import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Booking } from "../types";

const bookingsCollection = collection(db, "bookings");

export const CANCELLATION_WINDOW_HOURS = 24;

export function subscribeToStudentBookings(
  uid: string,
  onChange: (bookings: Booking[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    bookingsCollection,
    where("studentId", "==", uid),
    orderBy("date", "asc"),
    orderBy("startTime", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
    },
    onError
  );
}

export class BookingError extends Error {}

/** Atomically spends one credit and reserves the slot for the student. */
export async function bookSlot(uid: string, slotId: string): Promise<void> {
  const slotRef = doc(db, "slots", slotId);
  const userRef = doc(db, "users", uid);
  const bookingRef = doc(bookingsCollection);

  await runTransaction(db, async (transaction) => {
    const [slotSnap, userSnap] = await Promise.all([
      transaction.get(slotRef),
      transaction.get(userRef),
    ]);

    if (!slotSnap.exists()) throw new BookingError("This session no longer exists.");
    if (!userSnap.exists()) throw new BookingError("Your student profile could not be found.");

    const slot = slotSnap.data();
    const balance = typeof userSnap.data().balance === "number" ? userSnap.data().balance : 0;

    if (slot.status !== "open" || slot.bookedCount >= slot.capacity) {
      throw new BookingError("This session was just booked by someone else.");
    }
    if (balance < 1) {
      throw new BookingError("You don't have enough balance to book this session.");
    }

    const newBookedCount = slot.bookedCount + 1;
    transaction.update(slotRef, {
      bookedCount: newBookedCount,
      status: newBookedCount >= slot.capacity ? "full" : "open",
    });
    transaction.update(userRef, { balance: balance - 1 });
    transaction.set(bookingRef, {
      slotId,
      studentId: uid,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "confirmed",
      createdAt: serverTimestamp(),
    });
  });
}

function isWithinCancellationWindow(date: string, startTime: string): boolean {
  const sessionStart = new Date(`${date}T${startTime}:00`);
  const hoursUntilStart = (sessionStart.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntilStart < CANCELLATION_WINDOW_HOURS;
}

export { isWithinCancellationWindow };

/** Atomically refunds the credit and frees up the slot. */
export async function cancelBooking(booking: Booking, uid: string): Promise<void> {
  if (isWithinCancellationWindow(booking.date, booking.startTime)) {
    throw new BookingError(
      `Sessions can only be cancelled at least ${CANCELLATION_WINDOW_HOURS} hours in advance.`
    );
  }

  const slotRef = doc(db, "slots", booking.slotId);
  const userRef = doc(db, "users", uid);
  const bookingRef = doc(db, "bookings", booking.id);

  await runTransaction(db, async (transaction) => {
    const [slotSnap, userSnap] = await Promise.all([
      transaction.get(slotRef),
      transaction.get(userRef),
    ]);

    if (userSnap.exists()) {
      const balance = typeof userSnap.data().balance === "number" ? userSnap.data().balance : 0;
      transaction.update(userRef, { balance: balance + 1 });
    }

    if (slotSnap.exists()) {
      const slot = slotSnap.data();
      const newBookedCount = Math.max(0, slot.bookedCount - 1);
      transaction.update(slotRef, {
        bookedCount: newBookedCount,
        status: "open",
      });
    }

    transaction.update(bookingRef, { status: "cancelled" });
  });
}
