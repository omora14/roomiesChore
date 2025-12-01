import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/database/firebase";
import { useThemeColor } from "@/hooks/use-theme-color";
import { createUserDocument } from "@/services/database";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type AuthMode = "login" | "signup";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = backgroundColor !== "#fff" && backgroundColor !== "#FFFFFF";

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    resetMessages();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    resetMessages();
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    resetMessages();
  };

  const handleFirstNameChange = (text: string) => {
    setFirstName(text);
    resetMessages();
  };

  const handleLastNameChange = (text: string) => {
    setLastName(text);
    resetMessages();
  };

  const getErrorMessage = (errorCode: string, errorMessage?: string): string => {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "No internet connection. Please check your network and try again.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled. Please contact support.";
      case "auth/invalid-api-key":
        return "Configuration error. Please contact support.";
      default:
        // if it's a network-related error message
        if (errorMessage?.toLowerCase().includes("network") || 
            errorMessage?.toLowerCase().includes("internet") ||
            errorMessage?.toLowerCase().includes("disconnected")) {
          return "No internet connection. Please check your network and try again.";
        }
        return `An error occurred: ${errorMessage || errorCode || "Please try again."}`;
    }
  };

  const handleSubmit = async () => {
    resetMessages();

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      if (!username.trim()) {
        setError("Please enter a username.");
        return;
      }
      if (!firstName.trim()) {
        setError("Please enter your first name.");
        return;
      }
      if (!lastName.trim()) {
        setError("Please enter your last name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // connectivity first
    try {
      const testUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`;
      console.log("Testing Firebase connectivity to:", testUrl.substring(0, 50) + "...");
    } catch (testError) {
      console.error("Firebase connectivity test error:", testError);
    }

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccess("Successfully logged in! Redirecting...");
        // Redirect to dashboard after a brief delay to show success message
        setTimeout(() => {
          router.replace("/(tabs)/dashboard");
        }, 1000);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        
        // Create Firestore user document
        await createUserDocument(user.uid, {
          email: email.trim(),
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim()
        });
        
        setSuccess("Account created successfully! You can now log in.");
        // Optionally switch to login mode after successful signup
        setTimeout(() => {
          setMode("login");
          setPassword("");
          setUsername("");
          setFirstName("");
          setLastName("");
          setSuccess(null);
        }, 2000);
      }
    } catch (err: any) {
      console.error("Auth Error Details:", {
        code: err?.code,
        message: err?.message,
        fullError: err,
        stack: err?.stack
      });
      
      const errorCode = err?.code || "";
      const errorMessage = err?.message || "";
      
      // full error for debugging
      console.log("Error Code:", errorCode);
      console.log("Error Message:", errorMessage);
      
      const userFriendlyMessage = getErrorMessage(errorCode, errorMessage);
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <ThemedText style={styles.appTitle} type="title">
            Roomies Chore
          </ThemedText>
          <ThemedText style={styles.appSubtitle} type="subtitle">
            Management App
          </ThemedText>
        </View>

        {/* Mode Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: backgroundColor === "#fff" ? "#f0f0f0" : "#2a2a2a" }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              mode === "login" && [styles.toggleButtonActive, { backgroundColor: tintColor }],
            ]}
            onPress={() => {
              setMode("login");
              resetMessages();
            }}
            disabled={loading}
          >
            <ThemedText
              style={[
                styles.toggleButtonText,
                mode === "login" && styles.toggleButtonTextActive,
              ]}
            >
              Log In
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              mode === "signup" && [styles.toggleButtonActive, { backgroundColor: tintColor }],
            ]}
            onPress={() => {
              setMode("signup");
              resetMessages();
            }}
            disabled={loading}
          >
            <ThemedText
              style={[
                styles.toggleButtonText,
                mode === "signup" && styles.toggleButtonTextActive,
              ]}
            >
              Sign Up
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: backgroundColor === "#fff" ? "#f9f9f9" : "#1a1a1a",
                  color: textColor,
                  borderColor: error ? "#ff3b30" : backgroundColor === "#fff" ? "#ddd" : "#444",
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={backgroundColor === "#fff" ? "#999" : "#666"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={handleEmailChange}
              editable={!loading}
            />
          </View>

          {/* Username Input - only show for signup */}
          {mode === "signup" && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: backgroundColor === "#fff" ? "#f9f9f9" : "#1a1a1a",
                    color: textColor,
                    borderColor: error ? "#ff3b30" : backgroundColor === "#fff" ? "#ddd" : "#444",
                  },
                ]}
                placeholder="Enter your username"
                placeholderTextColor={backgroundColor === "#fff" ? "#999" : "#666"}
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={handleUsernameChange}
                editable={!loading}
              />
            </View>
          )}

          {/* First Name Input - only show for signup */}
          {mode === "signup" && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>First Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: backgroundColor === "#fff" ? "#f9f9f9" : "#1a1a1a",
                    color: textColor,
                    borderColor: error ? "#ff3b30" : backgroundColor === "#fff" ? "#ddd" : "#444",
                  },
                ]}
                placeholder="Enter your first name"
                placeholderTextColor={backgroundColor === "#fff" ? "#999" : "#666"}
                autoCapitalize="words"
                autoCorrect={false}
                value={firstName}
                onChangeText={handleFirstNameChange}
                editable={!loading}
              />
            </View>
          )}

          {/* Last Name Input - only show for signup */}
          {mode === "signup" && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Last Name</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: backgroundColor === "#fff" ? "#f9f9f9" : "#1a1a1a",
                    color: textColor,
                    borderColor: error ? "#ff3b30" : backgroundColor === "#fff" ? "#ddd" : "#444",
                  },
                ]}
                placeholder="Enter your last name"
                placeholderTextColor={backgroundColor === "#fff" ? "#999" : "#666"}
                autoCapitalize="words"
                autoCorrect={false}
                value={lastName}
                onChangeText={handleLastNameChange}
                editable={!loading}
              />
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: backgroundColor === "#fff" ? "#f9f9f9" : "#1a1a1a",
                  color: textColor,
                  borderColor: error ? "#ff3b30" : backgroundColor === "#fff" ? "#ddd" : "#444",
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={backgroundColor === "#fff" ? "#999" : "#666"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={handlePasswordChange}
              editable={!loading}
            />
            {mode === "signup" && (
              <ThemedText style={styles.hint}>
                Password must be at least 6 characters
              </ThemedText>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.messageContainer}>
              <View style={[
                styles.messageBox,
                isDark ? styles.errorBoxDark : styles.errorBox,
              ]}>
                <Text style={isDark ? styles.errorTextDark : styles.errorText}>
                  {error}
                </Text>
              </View>
            </View>
          )}

          {/* Success Message */}
          {success && (
            <View style={styles.messageContainer}>
              <View style={[
                styles.messageBox,
                isDark ? styles.successBoxDark : styles.successBox,
              ]}>
                <Text style={isDark ? styles.successTextDark : styles.successText}>
                  {success}
                </Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: tintColor },
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.submitButtonText} type="defaultSemiBold">
                {mode === "login" ? "Log In" : "Sign Up"}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.6,
  },
  toggleButtonTextActive: {
    color: "white",
    opacity: 1,
    fontWeight: "600",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    opacity: 0.6,
  },
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
  successBox: {
    backgroundColor: "#e8f5e9",
  },
  successBoxDark: {
    backgroundColor: "#1f3f1f",
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
  successText: {
    color: "#2e7d32",
    fontSize: 14,
    flex: 1,
  },
  successTextDark: {
    color: "#66bb6a",
    fontSize: 14,
    flex: 1,
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
});
