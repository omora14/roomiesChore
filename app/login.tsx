import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/database/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ----- LOGIN -----
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "You’re logged in!");
      // navigate to main screen here if needed
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Login Failed", message);
    }
  };

// ----- SIGN UP -----
const handleSignUp = async () => {
  if (!email || !password) {
    Alert.alert("Missing Fields", "Please enter both email and password.");
    return;
  }

  if (password.length < 6) {
    Alert.alert("Weak Password", "Password must be at least 6 characters.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
    Alert.alert("Success", "Account created!");
    // navigate to main screen here if needed
} catch (err) {
  console.error("Signup Error:", err);
  const message = err instanceof Error ? err.message : String(err);
  Alert.alert("Sign Up Failed", message);
}
};

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.appTitle} type="title">Roomies Chore</ThemedText>
        <ThemedText style={styles.appSubtitle} type="subtitle">Management App</ThemedText>
        <ThemedText style={styles.loginTitle} type="subtitle">Login or Sign Up</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginButtonText} type="defaultSemiBold">Login</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.loginButton, { backgroundColor: "#34C759" }]} onPress={handleSignUp}>
          <ThemedText style={styles.loginButtonText} type="defaultSemiBold">Sign Up</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  scrollContent: { alignItems: "center", paddingTop: 50, paddingBottom: 50 },
  appTitle: { fontSize: 28, marginTop: 20, textAlign: "center" },
  appSubtitle: { fontSize: 20, marginBottom: 50, textAlign: "center" },
  loginTitle: { fontSize: 24, marginBottom: 30 },
  input: {
    width: "100%", padding: 15, marginVertical: 10,
    borderWidth: 1, borderRadius: 8, borderColor: "#CCC",
    backgroundColor: "white", color: "black"
  },
  loginButton: {
    width: "100%", padding: 15, borderRadius: 8,
    alignItems: "center", marginTop: 20, marginBottom: 10,
    backgroundColor: "#007AFF"
  },
  loginButtonText: { color: "white", fontSize: 18 },
});
