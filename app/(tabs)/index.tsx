import { router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
// Remove unused imports like Image, Platform, HelloWave, ParallaxScrollView
// Import necessary components for a login screen
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LoginScreen() {
  const handleSignUpRedirect = () => {
    router.push('/CreateAnAccount'); // Navigate to your CreateAnAccount page
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Title */}
        <ThemedText style={styles.appTitle} type="title">
          Roomies Chore
        </ThemedText>
        <ThemedText style={styles.appSubtitle} type="subtitle">
          Management App
        </ThemedText>

        {/* Login Title */}
        <ThemedText style={styles.loginTitle} type="subtitle">
          Login to your account
        </ThemedText>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#999"
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={() => console.log('Login Pressed')}>
          <ThemedText style={styles.loginButtonText} type="defaultSemiBold">
            Login
          </ThemedText>
        </TouchableOpacity>

        {/* Or Login With Text */}
        <ThemedText style={styles.orLoginText}>
          Or Login with
        </ThemedText>

        {/* Social Login Buttons (Placeholder for G and f - Google and Facebook) */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <ThemedText style={styles.socialText}>G</ThemedText>
            {/* Replace with an actual icon component like <Ionicons name="logo-google" size={24} color="#FFF" /> */}
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <ThemedText style={styles.socialText}>f</ThemedText>
            {/* Replace with an actual icon component like <Ionicons name="logo-facebook" size={24} color="#FFF" /> */}
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        {/* this function haven't done yet */}
        {/* <Link href="/forgot-password" style={styles.link}>
          <ThemedText type="defaultSemiBold">Forgot password?</ThemedText>
        </Link> */}
        
        {/* Sign Up Link - Updated */}
        <View style={styles.signUpContainer}>
          <ThemedText>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={handleSignUpRedirect}>
            <ThemedText type="defaultSemiBold" style={styles.link}>
              Sign Up
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ---
// Styling for the Login Page
// ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
  appTitle: {
    fontSize: 28,
    marginTop: 20,
    marginBottom: 0,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 20,
    marginBottom: 50,
    textAlign: 'center',
  },
  loginTitle: {
    fontSize: 24,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#CCC', // Adjust color for light/dark theme if necessary
    // Add background color for better visibility in light/dark mode
    backgroundColor: 'white', 
    color: 'black',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#007AFF', // A standard blue for the primary button
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
  },
  orLoginText: {
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B5998', // A color for social buttons (e.g., Facebook blue)
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    marginBottom: 10,
    color: '#007AFF', // Standard link color
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 40,
  }
});