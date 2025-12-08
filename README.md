# RoomiesChore - Roommate Chore Tracker

## Project Title
**RoomiesChore** - A collaborative mobile application for managing shared household chores among roommates.

## Team Members
- [Owen Morales](https://www.linkedin.com/in/moralow/)
- [Sophie Archibald](https://www.linkedin.com/in/sophiearchibald/)
- [John Milius](https://www.linkedin.com/in/john-milius-62078822a/)
- [Rose Wang](http://linkedin.com/in/shi-jiaengineer/)
- [Chelsea Ochoa](https://www.linkedin.com/in/chelsea-ochoa/)
- [Jose Velastegui](https://www.linkedin.com/in/jose-velastegui/)

## Software Description

RoomiesChore is a React Native mobile application built with Expo that helps roommates organize, assign, and track household chores collaboratively. The app provides a centralized platform for managing shared responsibilities, ensuring fair task distribution, and maintaining accountability within a living group.

### Key Capabilities:
- **User Authentication**: Secure email/password registration and login system
- **Group Management**: Create and join roommate groups for collaborative chore tracking
- **Task Management**: Create, assign, and track chores with due dates and priorities
- **Real-time Synchronization**: Instant updates across all devices using Firebase Firestore
- **Dashboard**: Personalized view of assigned tasks, groups, and upcoming responsibilities
- **Theme Support**: Dark and light mode for user preference
- **Cross-platform**: Works on iOS, Android, and Web platforms

## Architecture

### Technology Stack
- **Frontend Framework**: React Native with Expo
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing)
- **State Management**: React Hooks and Context API
- **Backend Services**: Firebase (Authentication & Firestore)
- **UI Components**: Custom themed components with Material Icons

### Application Structure
```
roomiesChore/
├── app/                    # Application screens and routes
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── dashboard.tsx   # Main dashboard with groups and tasks
│   │   ├── tasksScreen.tsx # Task list and management
│   │   ├── addTask.tsx    # Task creation form
│   │   └── profile.tsx    # User profile and settings
│   ├── login.tsx          # Authentication screen
│   ├── group/[groupId].tsx # Group detail view
│   └── _layout.tsx        # Root layout with theme provider
├── components/            # Reusable React components
│   ├── themed-text.tsx    # Themed text component
│   ├── themed-view.tsx    # Themed view component
│   └── ui/               # UI components (group-card, task-list)
├── contexts/             # React Context providers
│   └── ThemeContext.tsx  # Theme management (light/dark mode)
├── services/             # Business logic and API services
│   ├── auth.tsx         # Authentication services
│   └── database.tsx     # Firestore database operations
├── hooks/               # Custom React hooks
│   ├── use-theme-color.ts
│   └── use-color-scheme.ts
├── constants/           # App constants
│   └── theme.ts        # Theme color definitions
└── database/           # Firebase configuration
    └── firebase.js     # Firebase initialization
```

### Data Flow
1. **Authentication**: Users register/login via Firebase Authentication
2. **Data Storage**: User data, groups, and tasks stored in Firestore
3. **Real-time Updates**: Firestore listeners provide live data synchronization
4. **Theme Management**: Context API manages theme state across the app

## Software Features

### User Authentication
- [x] Email/password registration and login
- [x] User profile creation with first name, last name, username, and email
- [x] Secure session management
- [ ] Password reset via email
- [ ] Social login options (Google/Apple)

### Roommate Group Management
- [x] View user's assigned groups
- [x] Display group information (name, color)
- [x] Navigate to group detail view
- [ ] Create new roommate groups
- [ ] Join groups via invite codes/links
- [ ] Manage group members and permissions
- [ ] Group settings and customization
- [ ] Leave group functionality

### Chore/Task Management
- [x] Create tasks with descriptions
- [x] Assign tasks to specific roommates
- [x] Set due dates for tasks
- [x] Set priority levels (Low, Medium, High)
- [x] View task lists (upcoming, all tasks)
- [x] Task filtering by group
- [ ] Edit existing tasks
- [ ] Delete tasks
- [ ] Set recurring task schedules (daily, weekly, monthly)
- [ ] Categorize tasks (cleaning, kitchen, bathroom, etc.)
- [ ] Difficulty ratings for tasks

### Task Tracking
- [x] View assigned tasks
- [x] View task completion status
- [x] Track tasks by due date
- [x] Dashboard with upcoming tasks
- [ ] Mark tasks as complete
- [ ] View completion history and statistics
- [ ] Send completion notifications to group
- [ ] Track overdue tasks and send reminders
- [ ] Personal and group progress dashboards
- [ ] Achievement system and point tracking

### UI/UX Features
- [x] Beautiful dark and light theme options
- [x] Theme toggle functionality
- [x] Responsive design for different screen sizes
- [x] Intuitive navigation with tab navigation
- [x] Loading states and error handling
- [x] Empty state handling
- [x] Modern card-based layouts
- [ ] Smooth animations and transitions
- [ ] Accessibility features and screen reader support

### Real-time Synchronization
- [x] Instant task updates across all devices
- [x] Real-time group data synchronization
- [x] Firebase Firestore integration
- [x] Automatic data synchronization
- [ ] Offline functionality with local storage
- [ ] Conflict resolution for simultaneous edits
- [ ] Push notifications for important updates
- [x] Cross-platform compatibility (iOS/Android/Web)

## Team Communication

### Communication Channels
- **Primary**: Teams
- **Version Control**: GitHub
- **Project Management**: GitHub Projects

### Meeting Schedule
- **Team Meetings**: Monday, Wednesday, and Friday
- **Individual Work**: Set by collaborator
- **Code Reviews**: Pull Requests

## Team Responsibilities

### Team 1: User Management
- **Owen, and John - Authentication Frontend Specialist**
  - User login/register screens
  - User profile management
  - UI components for authentication
  
- **Owen, and John - Authentication Backend Specialist**
  - Firebase Auth integration
  - Group member management
  - Security & session handling
  - API connections

### Team 2: Core Features
- **Sophie, and John - Chore Management Specialist**
  - Create/edit/delete chores
  - Chore categories and tags
  - Due dates and scheduling
  - Chore assignment system

- **Sophie, John, Chelsea, and Rose - Task Tracking Specialist**
  - Mark tasks complete/incomplete
  - Progress tracking dashboard
  - Task history logging
  - Notification system

### Team 3: UI & Sync
- **Owen, Jose, and Chelsea - UI/UX Design Specialist**
  - App theme and styling system
  - Dark/light mode toggle
  - Responsive layouts
  - Animations and transitions

- **John, and Sophie - Real-time Sync Specialist**
  - Firebase Firestore setup
  - Real-time data synchronization
  - Offline functionality
  - Conflict resolution

## Reflections

### Retrospection Meeting Findings

#### 3 Things That Went Well

1. **Effective Collaboration on UI/UX Improvements**
   - The team successfully implemented a cohesive design system with dark/light mode support across all screens
   - Consistent styling and theming created a professional, polished user experience
   - Good communication during the UI overhaul ensured all screens followed the same design patterns

2. **Successful Firebase Integration**
   - Firebase Authentication and Firestore were successfully integrated, providing secure user management and real-time data synchronization
   - The database structure was well-designed to support scalable group and task management
   - Real-time listeners enabled instant updates across devices

3. **Modular Code Architecture**
   - The project structure with separate services, components, and contexts made the codebase maintainable
   - Reusable components (ThemedText, ThemedView) reduced code duplication
   - Clear separation of concerns between authentication, database operations, and UI components

#### 3 Things That Did Not Go Well

1. **Incomplete Feature Implementation**
   - Several planned features (password reset, social login, task editing/deletion, notifications) were not completed
   - The team may have over-scoped the initial feature list, leading to incomplete deliverables
   - Some core functionality like task completion marking is still pending

2. **Merge Conflicts and Code Integration Issues**
   - Team members experienced merge conflicts when pulling changes from main, indicating a need for better branch management
   - Incomplete code merges resulted in duplicate code and broken file structures that required cleanup
   - Lack of consistent pull/merge practices led to integration difficulties

3. **Limited Testing and Quality Assurance**
   - Insufficient testing of features across different scenarios and edge cases
   - Some features were implemented but not thoroughly validated for user experience
   - Missing error handling in some areas of the application

#### How to Improve in Future Team Projects

1. **Better Project Planning and Scope Management**
   - Start with a minimal viable product (MVP) and prioritize core features
   - Use agile methodologies with shorter sprints to ensure regular deliverables
   - Create a clear feature prioritization matrix to focus on high-impact features first
   - Set realistic deadlines and adjust scope based on team capacity

2. **Improved Version Control Practices**
   - Establish clear Git workflow guidelines (feature branches, pull request process)
   - Schedule regular merge sessions to integrate code frequently and avoid large conflicts
   - Use pull request reviews to catch issues before merging
   - Create a checklist for pulling latest changes before starting new work

3. **Enhanced Testing and Quality Processes**
   - Implement test-driven development (TDD) or at minimum, manual testing checklists
   - Conduct regular code reviews to catch bugs and improve code quality
   - Set up automated testing where possible
   - Allocate dedicated time for QA before considering features complete
   - Create user acceptance criteria for each feature before implementation

---

## Installation & Setup

### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn package manager
- Expo CLI (install globally with `npm install -g expo-cli`)
- Firebase account
- Git

### Installation Steps

1. Clone the repository:
```bash
git clone <https://github.com/omora14/roomiesChore.git>
cd roomiesChore
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values (see Firebase Setup section)

4. Start the development server:
```bash
npm start
```

### Firebase Setup

This application uses Firebase for authentication and data storage. Follow these steps:

#### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project
4. Note your project ID

#### 2. Enable Authentication
1. In Firebase Console, navigate to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable the "Email/Password" provider
4. Click **Save**

#### 3. Create Firestore Database
1. In Firebase Console, navigate to **Firestore Database**
2. Click "Create database"
3. Start in test mode (for development) or production mode
4. Choose a location for your database

#### 4. Get Firebase Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "RoomiesChore Web")
5. Copy the Firebase configuration object

#### 5. Environment Configuration
1. Copy `.env.example` to `.env` (if it exists) or create a new `.env` file
2. Add your Firebase configuration:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important:** 
- Never commit the `.env` file to version control
- All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in Expo applications

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **Firebase Authentication** - User authentication
- **Firebase Firestore** - Real-time database
- **Expo Router** - File-based routing
- **React Navigation** - Navigation library
- **Material Icons** - Icon library
- **AsyncStorage** - Local storage for theme preferences

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly on multiple platforms
4. Submit a pull request with a clear description

## Support

For issues and questions, please open an issue in the repository or contact the development team.
