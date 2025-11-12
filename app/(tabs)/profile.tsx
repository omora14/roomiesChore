import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/database/firebase";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get theme colors for styling
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const isDark = backgroundColor !== "#fff" && backgroundColor !== "#FFFFFF";

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Sign the user out from Firebase
      await signOut(auth);

      // 2. Redirect to the login screen
      router.replace("/login");
    } catch (err: any) {
      console.error("Logout Error:", err);
      setError("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Profile
      </ThemedText>

      {/* Error Message Display */}
      {error && (
        <View style={styles.messageContainer}>
          <View
            style={[
              styles.messageBox,
              isDark ? styles.errorBoxDark : styles.errorBox,
            ]}
          >
            <Text style={isDark ? styles.errorTextDark : styles.errorText}>
              {error}
            </Text>
          </View>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          // Use tintColor for consistency, or a red color for "danger"
          { backgroundColor: "#ff3b30" }, // A standard iOS red color
          // { backgroundColor: tintColor }, // Use this to match your app theme
          loading && styles.submitButtonDisabled,
        ]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.submitButtonText}>Log Out</ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 16,
    opacity: 0.7,
  },
  submitButton: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Error message styles
  messageContainer: {
    marginBottom: 16,
  },
  messageBox: {
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: "#ffebee",
  },
  errorBoxDark: {
    backgroundColor: "#3f1f1f",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    flex: 1,
  },
  errorTextDark: {
    color: "#ef5350",
    fontSize: 14,
    flex: 1,
  },
});
