import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/expo";
import React from "react";

export default function HomeScreen() {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: "#1DA1F2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "600",
  },
});