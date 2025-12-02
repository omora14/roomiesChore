import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/contexts/ThemeContext";
import { auth } from "@/database/firebase";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUserId } from "@/services/auth";
import { getUserData } from "@/services/database";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
  } | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // Get theme colors for styling
  const { theme, toggleTheme } = useTheme();
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const isDark = theme === "dark";

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await getCurrentUserId();
        const data = await getUserData(userId);
        setUserData(data || null);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoadingUserData(false);
      }
    };
    loadUserData();
  }, []);

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>

          {/* User Info Card */}
          {!loadingUserData && userData && (
            <View style={[
              styles.userCard,
              {
                backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
                borderColor: isDark ? '#3a3a3a' : '#e0e0e0',
              }
            ]}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: tintColor }]}>
                  <ThemedText style={styles.avatarText}>
                    {userData.firstName?.[0]?.toUpperCase() || userData.username?.[0]?.toUpperCase() || 'U'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.userName}>
                {userData.firstName && userData.lastName
                  ? `${userData.firstName} ${userData.lastName}`
                  : userData.username || 'User'}
              </ThemedText>
              {userData.email && (
                <ThemedText style={styles.userEmail}>{userData.email}</ThemedText>
              )}
              {userData.username && (
                <ThemedText style={styles.userUsername}>@{userData.username}</ThemedText>
              )}
            </View>
          )}

          {/* Theme Toggle */}
          <TouchableOpacity
            style={[
              styles.settingsButton,
              {
                backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
                borderColor: isDark ? '#3a3a3a' : '#e0e0e0',
              }
            ]}
            onPress={toggleTheme}
          >
            <View style={styles.settingsButtonContent}>
              <MaterialIcons
                name={isDark ? "light-mode" : "dark-mode"}
                size={24}
                color={textColor}
              />
              <ThemedText style={styles.settingsButtonText}>
                {isDark ? "Light Mode" : "Dark Mode"}
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={textColor} opacity={0.5} />
          </TouchableOpacity>

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
              { backgroundColor: "#ff3b30" },
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="logout" size={20} color="white" />
                <ThemedText style={styles.submitButtonText}>Log Out</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  userCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  userUsername: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
    marginTop: "auto",
    flexDirection: 'row',
    gap: 8,
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
