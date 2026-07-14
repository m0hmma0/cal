import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Button from "../components/Button";
import BalancePill from "../components/BalancePill";
import { useAuth } from "../context/AuthContext";
import { subscribeToUpcomingOpenSlots } from "../data/slots";
import { BookingError, bookSlot } from "../data/bookings";
import { Slot } from "../types";
import { colors, radius, spacing, typography } from "../theme/theme";
import { formatDateLong, formatTime, todayISODate } from "../utils/datetime";
import { confirmAction, showAlert } from "../utils/alert";

export default function BookingScreen() {
  const { user, profile } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayISODate());
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToUpcomingOpenSlots(setSlots, (err) =>
      console.warn("Failed to load sessions", err)
    );
    return unsubscribe;
  }, []);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const slot of slots) {
      marks[slot.date] = { marked: true, dotColor: colors.primary };
    }
    return {
      ...marks,
      [selectedDate]: {
        ...(marks[selectedDate] ?? {}),
        selected: true,
        selectedColor: colors.primary,
      },
    } as Record<string, any>;
  }, [slots, selectedDate]);

  const slotsForSelectedDate = useMemo(
    () => slots.filter((slot) => slot.date === selectedDate),
    [slots, selectedDate]
  );

  async function handleBook(slot: Slot) {
    if (!user) return;
    if ((profile?.balance ?? 0) < 1) {
      showAlert(
        "Insufficient balance",
        "You don't have any sessions left. Contact your instructor to top up your balance."
      );
      return;
    }

    confirmAction(
      "Confirm booking",
      `Book the ${formatTime(slot.startTime)} session on ${formatDateLong(slot.date)}? This will use 1 session from your balance.`,
      "Book",
      async () => {
        setBookingSlotId(slot.id);
        try {
          await bookSlot(user.uid, slot.id);
          showAlert("Session booked!", "Your session has been confirmed.");
        } catch (err) {
          const message =
            err instanceof BookingError
              ? err.message
              : "Something went wrong booking this session. Please try again.";
          showAlert("Booking failed", message);
        } finally {
          setBookingSlotId(null);
        }
      }
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={typography.title}>Book a session</Text>
        <BalancePill balance={profile?.balance ?? 0} />
      </View>

      <Calendar
        current={selectedDate}
        minDate={todayISODate()}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        style={styles.calendar}
        theme={{
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
        }}
      />

      <Text style={styles.sectionTitle}>{formatDateLong(selectedDate)}</Text>

      <FlatList
        data={slotsForSelectedDate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No open sessions on this day. Pick another date on the calendar.
          </Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.slotCard}>
            <View style={styles.slotInfo}>
              <Text style={typography.subtitle}>
                {formatTime(item.startTime)} – {formatTime(item.endTime)}
              </Text>
              <Text style={styles.slotSpots}>
                {item.capacity - item.bookedCount} spot
                {item.capacity - item.bookedCount === 1 ? "" : "s"} left
              </Text>
            </View>
            <Button
              label="Book"
              onPress={() => handleBook(item)}
              loading={bookingSlotId === item.id}
              disabled={bookingSlotId !== null}
              style={styles.bookButton}
            />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  calendar: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slotInfo: {
    gap: 2,
  },
  slotSpots: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bookButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
