# RoomiesChore

A React Native application built with Expo for managing shared household chores among roommates. This app helps roommates organize tasks, track assignments, and maintain a clean living space together.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

## Features

- User authentication with email and password
- Secure user registration and login
- Dashboard for viewing assigned tasks
- Roommate group management
- Task assignment and tracking
- Dark mode support
- Cross-platform support (iOS, Android, Web)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn package manager
- Expo CLI (install globally with `npm install -g expo-cli`)
- Firebase account
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd roomiesChore
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see [Environment Configuration](#environment-configuration))

4. Start the development server:
```bash
npm start
```

## Firebase Setup

This application uses Firebase for authentication and data storage. Follow these steps to set up Firebase:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project
4. Note your project ID

### 2. Enable Authentication

1. In Firebase Console, navigate to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable the "Email/Password" provider
4. Click **Save**

### 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "RoomiesChore Web")
5. Copy the Firebase configuration object

The configuration will look like this:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 4. Configure Authorized Domains (Optional)

For web deployment, you may need to add authorized domains:

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your deployment domains (e.g., `localhost`, your production domain)

## Environment Configuration

The application uses environment variables to securely store Firebase configuration. Follow these steps:

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open the `.env` file and fill in your Firebase configuration values:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

3. Replace the placeholder values with your actual Firebase configuration values from step 3 of Firebase Setup.

**Important:** 
- Never commit the `.env` file to version control (it's already in `.gitignore`)
- The `.env.example` file is a template and does not contain sensitive information
- All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in Expo applications

## Running the Application

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open the Expo DevTools in your browser. You can then:

- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your mobile device

### Platform-Specific Commands

```bash
# Run on web
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Building for Production

For production builds, refer to the [Expo documentation](https://docs.expo.dev/build/introduction/) for building standalone apps.

## Project Structure

```
roomiesChore/
├── app/                    # Application screens and routes
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── dashboard.tsx  # Main dashboard screen
│   │   └── explore.tsx    # Explore screen
│   ├── login.tsx          # Authentication screen
│   ├── index.tsx          # Splash/entry screen
│   └── _layout.tsx        # Root layout configuration
├── components/            # Reusable React components
│   ├── themed-text.tsx    # Themed text component
│   ├── themed-view.tsx    # Themed view component
│   └── ui/               # UI components
├── constants/            # App constants and theme
│   └── theme.ts          # Theme configuration
├── database/             # Firebase configuration
│   └── firebase.js       # Firebase initialization
├── hooks/                # Custom React hooks
├── assets/               # Images, fonts, and other assets
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **Firebase** - Authentication and backend services
- **Expo Router** - File-based routing for Expo
- **React Navigation** - Navigation library
- **React Native Safe Area Context** - Safe area handling

## Authentication Flow

1. User opens the application and sees the login screen
2. User can toggle between "Log In" and "Sign Up" modes
3. For new users:
   - Enter email and password (minimum 6 characters)
   - Click "Sign Up" to create an account
   - Account is created in Firebase Authentication
   - User is prompted to log in
4. For existing users:
   - Enter email and password
   - Click "Log In" to authenticate
   - Upon successful authentication, user is redirected to the dashboard

## Troubleshooting

### Firebase Authentication Not Working

- Verify that Email/Password authentication is enabled in Firebase Console
- Check that all environment variables in `.env` are correctly set
- Ensure your Firebase project is active and not in test mode restrictions
- Check browser console for detailed error messages

### Environment Variables Not Loading

- Ensure all variables are prefixed with `EXPO_PUBLIC_`
- Restart the Expo development server after changing `.env` file
- Verify that `.env` file is in the root directory
- Check that variable names match exactly (case-sensitive)

### Network Errors

- Verify your internet connection
- Check if browser extensions are blocking Firebase requests
- Verify Firebase API key restrictions in Google Cloud Console
- Test in incognito/private browser mode

## Security Notes

- Never commit `.env` files containing sensitive information
- Keep your Firebase API keys secure
- Regularly rotate API keys if compromised
- Use Firebase Security Rules to protect your database
- Enable Firebase App Check for additional security

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly on multiple platforms
4. Submit a pull request with a clear description

## Support

For issues and questions, please open an issue in the repository or contact the development team.
