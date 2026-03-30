import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/theme";
import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";

const { width, height } = Dimensions.get("window");

export default function ScreenLogin() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleGooglePress = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("OAuth Error", JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.xLogo}>𝕏</Text>
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.headline}>Happening now</Text>
        <Text style={styles.subheadline}>Join today.</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.85}
          onPress={handleGooglePress}
        >
          <Ionicons name="logo-google" size={20} color="#000" style={styles.btnIcon} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleGooglePress}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 28,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: height * 0.05,
  },
  xLogo: {
    fontSize: 52,
    color: COLORS.white,
    fontWeight: "bold",
  },
  centerSection: {
    flex: 1.2,
    justifyContent: "flex-end",
    paddingBottom: 32,
  },
  headline: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 4,
  },
  subheadline: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
  },
  bottomSection: {
    flex: 2,
    justifyContent: "flex-start",
    paddingTop: 28,
    gap: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 999,
    width: "100%",
  },
  btnIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  dividerText: {
    color: COLORS.grey,
    marginHorizontal: 12,
    fontSize: 14,
  },
  signinRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  signinText: {
    color: COLORS.grey,
    fontSize: 15,
  },
  signinLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  terms: {
    color: COLORS.grey,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  termsLink: {
    color: COLORS.primary,
  },
});