export const colors = {
  background: "#F5F6FA",
  surface: "#FFFFFF",
  primary: "#3A5AFF",
  primaryDark: "#2740C7",
  text: "#161821",
  textMuted: "#6B7080",
  border: "#E4E6EF",
  success: "#1FA971",
  danger: "#E0473C",
  disabled: "#C7CBDA",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: { fontSize: 24, fontWeight: "700" as const },
  subtitle: { fontSize: 17, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
};

/** Caps content width on large/tablet screens while staying full-bleed on phones. */
export const MAX_CONTENT_WIDTH = 480;
