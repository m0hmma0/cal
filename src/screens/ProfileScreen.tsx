import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Button from "../components/Button";
import BalancePill from "../components/BalancePill";
import { useAuth } from "../context/AuthContext";
import { colors, spacing, typography } from "../theme/theme";

export default function ProfileScreen() {
  const { profile, user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <Text style={[typography.title, styles.header]}>Profile</Text>

      <Card style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {(profile?.name || user?.email || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.name || "Student"}</Text>
        <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
        <BalancePill balance={profile?.balance ?? 0} />
      </Card>

      <Text style={styles.helpText}>
        Need more sessions? Contact your instructor to top up your balance.
      </Text>

      <Button
        label="Log out"
        variant="secondary"
        onPress={handleLogout}
        loading={signingOut}
        style={styles.logoutButton}
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
  card: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
  },
  name: {
    ...typography.subtitle,
  },
  email: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  helpText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
});
