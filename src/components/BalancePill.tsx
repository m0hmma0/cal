import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme/theme";

export default function BalancePill({ balance }: { balance: number }) {
  const label = balance === 1 ? "1 session left" : `${balance} sessions left`;
  return (
    <View style={[styles.pill, balance === 0 && styles.pillEmpty]}>
      <Text style={[styles.text, balance === 0 && styles.textEmpty]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#EAF0FF",
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
  },
  pillEmpty: {
    backgroundColor: "#FDEDEC",
  },
  text: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  textEmpty: {
    color: colors.danger,
  },
});
