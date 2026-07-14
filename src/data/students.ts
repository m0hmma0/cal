import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { StudentProfile } from "../types";

export function subscribeToStudentProfile(
  uid: string,
  onChange: (profile: StudentProfile | null) => void,
  onError?: (error: Error) => void
) {
  const ref = doc(db, "users", uid);
  return onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      const data = snapshot.data();
      onChange({
        uid,
        name: data.name ?? "",
        email: data.email ?? "",
        balance: typeof data.balance === "number" ? data.balance : 0,
      });
    },
    onError
  );
}
