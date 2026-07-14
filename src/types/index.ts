export interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  balance: number;
}

export type SlotStatus = "open" | "full";

export interface Slot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm, 24h
  endTime: string; // HH:mm, 24h
  capacity: number;
  bookedCount: number;
  status: SlotStatus;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: number;
}
