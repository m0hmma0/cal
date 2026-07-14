import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Slot } from "../types";

const slotsCollection = collection(db, "slots");

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Subscribes to every open, upcoming slot so the calendar can mark available dates. */
export function subscribeToUpcomingOpenSlots(
  onChange: (slots: Slot[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    slotsCollection,
    where("status", "==", "open"),
    where("date", ">=", todayISODate()),
    orderBy("date", "asc"),
    orderBy("startTime", "asc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Slot)));
    },
    onError
  );
}
