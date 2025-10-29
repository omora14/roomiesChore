import { auth, db } from '@/database/firebase';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Configure Google Sign-In (add this near the top of your file)
GoogleSignin.configure({
    webClientId: '124104185421-dpmqofiurrt0hq7f5pjb75seuelrp1b6.apps.googleusercontent.com', // From Firebase Console
});

export default function CreateAnAccount() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            // Create user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );

            // Add user data to Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                username: formData.username,
                email: formData.email,
                createdAt: new Date(),
            });

            console.log('Account creation data:', formData);
            Alert.alert('Success', 'Account created successfully!');

        } catch (error: any) {
            console.error('Error creating account:', error);
            Alert.alert('Error', error.message || 'Failed to create account');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            
            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();
            
            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(idToken);
            
            // Sign-in the user with the credential
            const userCredential = await signInWithCredential(auth, googleCredential);
            
            // Check if user already exists in Firestore
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            
            if (!userDoc.exists()) {
                // Create user document in Firestore if it doesn't exist
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    username: userCredential.user.displayName || 'Google User',
                    email: userCredential.user.email,
                    createdAt: new Date(),
                    provider: 'google',
                });
            }
            
            Alert.alert('Success', 'Signed in with Google successfully!');
            
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            Alert.alert('Error', error.message || 'Failed to sign in with Google');
        }
    };

   const handleBackToLogin = () => {
        router.back(); // Go back to the previous screen (login)
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Roomies Chore</Text>
                <Text style={styles.subtitle}>Management App</Text>
            </View>

            {/* Form Title */}
            <Text style={styles.formTitle}>Create your account</Text>

            {/* Username Input */}
            <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person" size={24} color="#fff" />
                </View>
                <TextInput
                    style={styles.input}
                    value={formData.username}
                    onChangeText={(value) => handleInputChange('username', value)}
                    placeholder="Username"
                    placeholderTextColor="#999"
                />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                    <Ionicons name="mail" size={24} color="#fff" />
                </View>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={24} color="#fff" />
                </View>
                <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={24} color="#fff" />
                </View>
                <TextInput
                    style={styles.input}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                />
            </View>

            {/* Register Button */}
            <TouchableOpacity style={styles.registerButton} onPress={handleSubmit}>
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>

            {/* Social Login Section */}
            <View style={styles.socialLoginContainer}>
                <Text style={styles.orText}>— Or Register with —</Text>
                
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                    <Ionicons name="logo-google" size={32} color="#4285F4" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 20,
    },
    backButton: {
        width: 48,
        height: 48,
        backgroundColor: '#2563EB',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        color: '#1F2937',
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        backgroundColor: '#2563EB',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
    },
    registerButton: {
        backgroundColor: '#2563EB',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    socialLoginContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    orText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    googleButton: {
        width: 64,
        height: 64,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});