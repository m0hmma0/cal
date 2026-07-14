import { useEffect, useState } from "react";
import { subscribeToStudentBookings } from "../data/bookings";
import { Booking } from "../types";

export function useStudentBookings(uid: string | undefined): Booking[] {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!uid) {
      setBookings([]);
      return;
    }
    const unsubscribe = subscribeToStudentBookings(uid, setBookings, (err) =>
      console.warn("Failed to load bookings", err)
    );
    return unsubscribe;
  }, [uid]);

  return bookings;
}
