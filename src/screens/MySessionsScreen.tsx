import React, { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useStudentBookings } from "../hooks/useStudentBookings";
import { BookingError, cancelBooking } from "../data/bookings";
import { Booking } from "../types";
import { colors, spacing, typography } from "../theme/theme";
import { formatDateLong, formatTime, todayISODate } from "../utils/datetime";
import { confirmAction, showAlert } from "../utils/alert";

export default function MySessionsScreen() {
  const { user } = useAuth();
  const bookings = useStudentBookings(user?.uid);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const sections = useMemo(() => {
    const today = todayISODate();
    const upcoming = bookings.filter(
      (b) => b.status === "confirmed" && b.date >= today
    );
    const history = bookings.filter(
      (b) => b.status === "cancelled" || (b.status === "confirmed" && b.date < today)
    );
    return [
      { title: "Upcoming", data: upcoming },
      { title: "Past & cancelled", data: history },
    ].filter((section) => section.data.length > 0);
  }, [bookings]);

  async function handleCancel(booking: Booking) {
    confirmAction(
      "Cancel session",
      `Cancel your ${formatTime(booking.startTime)} session on ${formatDateLong(booking.date)}? Your session credit will be refunded.`,
      "Cancel session",
      async () => {
        if (!user) return;
        setCancellingId(booking.id);
        try {
          await cancelBooking(booking, user.uid);
        } catch (err) {
          const message =
            err instanceof BookingError
              ? err.message
              : "Something went wrong cancelling this session.";
          showAlert("Cancel failed", message);
        } finally {
          setCancellingId(null);
        }
      }
    );
  }

  return (
    <Screen style={styles.screen}>
      <Text style={[typography.title, styles.header]}>My sessions</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't booked any sessions yet. Head to the Book tab to get started.
          </Text>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const isUpcomingConfirmed =
            item.status === "confirmed" && item.date >= todayISODate();
          return (
            <Card style={styles.card}>
              <View>
                <Text style={typography.subtitle}>{formatDateLong(item.date)}</Text>
                <Text style={styles.time}>
                  {formatTime(item.startTime)} – {formatTime(item.endTime)}
                </Text>
                {item.status === "cancelled" && (
                  <Text style={styles.cancelledLabel}>Cancelled</Text>
                )}
              </View>
              {isUpcomingConfirmed && (
                <Button
                  label="Cancel"
                  variant="secondary"
                  onPress={() => handleCancel(item)}
                  loading={cancellingId === item.id}
                  disabled={cancellingId !== null}
                  style={styles.cancelButton}
                />
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  cancelledLabel: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  cancelButton: {
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
