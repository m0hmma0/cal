# Student Sessions

A mobile-first React Native (Expo) app that lets your students log in, see their
session balance, and book available appointment slots on a calendar. Built for
publishing to both the Apple App Store and Google Play.

## How it works

- **Auth**: Firebase Authentication (email/password). You create one account
  per student.
- **Data**: Firebase Firestore, with three collections:
  - `users/{uid}` — `{ name, email, balance }`. `balance` is the number of
    prepaid session credits the student has left.
  - `slots/{slotId}` — `{ date: "YYYY-MM-DD", startTime: "HH:mm", endTime: "HH:mm", capacity, bookedCount, status: "open" | "full" }`.
    This is your available-times calendar.
  - `bookings/{bookingId}` — `{ studentId, slotId, date, startTime, endTime, status: "confirmed" | "cancelled", createdAt }`.
- **No custom backend server**: you (the instructor) manage student balances
  and open time slots directly from the Firebase console. Booking and
  cancellation are done client-side using Firestore transactions, so a
  balance and a slot's `bookedCount` always update atomically together.

## 1. Create your Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and create a new project.
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create a database (start in production mode).
4. Deploy the security rules in `firestore.rules` (Firestore → Rules tab, paste
   the contents of the file, or use the Firebase CLI: `firebase deploy --only firestore:rules`).
5. Create the composite indexes in `firestore.indexes.json` — either run
   `firebase deploy --only firestore:indexes` (Firebase CLI), or just run the
   app once and click the two "create index" links that show up in the logs
   the first time the calendar/bookings queries run (Firestore requires an
   index whenever a query both filters and sorts on multiple fields). Each
   index takes a few minutes to finish building.
6. **Project settings** → General → "Your apps" → add a **Web app** (yes, even
   though this is a mobile app — the Firebase JS SDK used here connects the
   same way). Copy the config values shown.
7. Copy `.env.example` to `.env` and fill in the values from step 6:

   ```
   cp .env.example .env
   ```

## 2. Add students

For each student:

1. Authentication → Users → **Add user** (email + a starting password they
   can change later — Firebase doesn't support setting an initial display
   name here).
2. Firestore → `users` collection → add a document with that **same UID** as
   the document ID, containing:

   ```json
   {
     "name": "Ada Lovelace",
     "email": "ada@example.com",
     "balance": 5
   }
   ```

To top up a student's balance later (e.g. after they pay for more sessions),
just edit the `balance` field on their `users/{uid}` document.

## 3. Add available session times

In Firestore, add documents to the `slots` collection, e.g.:

```json
{
  "date": "2026-07-21",
  "startTime": "16:00",
  "endTime": "16:45",
  "capacity": 1,
  "bookedCount": 0,
  "status": "open"
}
```

- `capacity` is how many students can book that same slot (use `1` for 1:1
  sessions, higher for group sessions).
- Always create new slots with `bookedCount: 0` and `status: "open"` — the app
  updates both fields automatically as students book/cancel.

## 4. Run the app locally

```
npm install
npm start
```

Scan the QR code with the **Expo Go** app (iOS/Android), or press `i`/`a` in
the terminal to launch an iOS Simulator / Android emulator.

## 5. Build & publish to the App Store / Google Play

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```
npm install -g eas-cli
eas login
eas build:configure          # links this project to your Expo account
```

Before your first production build:

- In `app.json`, change `expo.ios.bundleIdentifier` and `expo.android.package`
  from the `com.yourcompany.studentsessions` placeholder to your own reverse-DNS
  identifier.
- Replace the placeholder icons/splash in `assets/` with your own branding.
- Set the same `EXPO_PUBLIC_FIREBASE_*` values from your `.env` as
  [EAS secrets/environment variables](https://docs.expo.dev/build-reference/variables/)
  so production builds embed them.

Then build and submit:

```
eas build --platform ios --profile production
eas build --platform android --profile production

eas submit --platform ios
eas submit --platform android
```

You'll need an active Apple Developer Program membership ($99/yr) and a
Google Play Developer account ($25 one-time) to actually publish.

## Project structure

```
App.tsx                     App root: providers + navigation
src/
  components/               Reusable UI (Button, Card, Screen, BalancePill...)
  context/AuthContext.tsx    Firebase auth state + student profile
  data/                      Firestore reads/writes (students, slots, bookings)
  firebase/config.ts         Firebase app/auth/firestore initialization
  hooks/                     Small data hooks (e.g. useStudentBookings)
  navigation/                Auth vs. main app navigation
  screens/                   Login, Book, My Sessions, Profile
  theme/                     Shared colors/spacing/typography
  types/                     Shared TypeScript types
firestore.rules              Firestore security rules
eas.json                     EAS Build profiles
```

## Known limitations / where to harden next

- **No admin UI**: balances and slots are managed by hand in the Firebase
  console, by design (see project setup). If you outgrow that, the next step
  is a small admin screen or a Cloud Function.
- **Client-side balance transactions**: because there's no backend server,
  the app updates a student's balance directly from their device inside a
  Firestore transaction. The security rules constrain each write to a single
  +/-1 change on `balance`/`bookedCount`, but a determined user could still
  script repeated cancel/book cycles. For a small roster of your own
  students this is a reasonable trade-off; if you need stronger guarantees,
  move booking/cancellation into a Cloud Function that runs with elevated
  privileges instead of running the transaction on-device.
- **Cancellation window** is a constant (`CANCELLATION_WINDOW_HOURS` in
  `src/data/bookings.ts`, currently 24h) — adjust to taste.
