import { COLORS } from "@/constants/theme";
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  brandSection: {
    alignItems: "center",
    marginTop: height * 0.14,
  },
  logoContainer: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  appName: {
    fontSize: 44,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 6,
    lineHeight: 50,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.grey,
    letterSpacing: 0.2,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    maxHeight: 260,
  },
  loginSection: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
    gap: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 999,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIconContainer: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F1419",
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.greyLight,
    maxWidth: 280,
    lineHeight: 17,
  },
});