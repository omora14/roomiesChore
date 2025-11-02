import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/database/firebase";
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ----- LOGIN ONLY -----
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "You're logged in!");
      router.replace('../(tabs)/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      Alert.alert("Login Failed", message);
    }
  };

  // ----- REDIRECT TO CREATE ACCOUNT -----
  const handleCreateAccountRedirect = () => {
    router.push('../(auth)/CreateAnAccount');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.appTitle} type="title">Roomies Chore</ThemedText>
        <ThemedText style={styles.appSubtitle} type="subtitle">Management App</ThemedText>
        <ThemedText style={styles.loginTitle} type="subtitle">Login</ThemedText>

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

        {/* Link to Create Account Page */}
        <View style={styles.createAccountContainer}>
          <ThemedText style={styles.createAccountText}>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={handleCreateAccountRedirect}>
            <ThemedText style={styles.createAccountLink} type="defaultSemiBold">
              Create Account
            </ThemedText>
          </TouchableOpacity>
        </View>
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
  createAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  createAccountText: {
    fontSize: 16,
  },
  createAccountLink: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
