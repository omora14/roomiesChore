/**
 * SEED SCRIPT USING API CALLS (No Service Account Key)
 * Uses your existing database functions to create:
 * - 10 users
 * - 2 groups (5 users per group)
 * - 30 tasks (3 per user)
 */

import dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { addDoc, arrayUnion, collection, doc, getFirestore, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

// Your Firebase config (same as in firebase.js)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  console.log("Starting seed...");

  // Use timestamp to make unique emails each run
  const timestamp = Date.now();

  // -----------------------------
  // 1. CREATE USERS
  // -----------------------------
  const users = [];
  
  for (let i = 1; i <= 10; i++) {
    try {
      // Create auth user with unique email
      const email = `user${i}-${timestamp}@example.com`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        'password123'
      );
      
      const userId = userCredential.user.uid;
      
      // Create user document - USE setDoc NOT updateDoc
      const userRef = doc(db, 'users', userId);
      const userData = {
        assigned_groups: [],
        assigned_tasks: [],
        createdAt: serverTimestamp(),
        created_tasks: [],
        email: email,
        firstName: `User${i}`,
        lastName: `Test${i}`,
        username: `user${i}`
      };
      
      await setDoc(userRef, userData);
      
      users.push({ id: userId, ref: userRef, data: userData });
      console.log(`✔️ Created user ${i}: ${email}`);
      
    } catch (error) {
      console.error(`Error creating user ${i}:`, error.code);
    }
  }

  console.log(`✔️ Created ${users.length} users`);
  
  // Check if we have enough users to continue
  if (users.length < 10) {
    console.error('❌ Not enough users created. Exiting.');
    process.exit(1);
  }

  // -----------------------------
  // 2. CREATE 2 GROUPS (5 users each)
  // -----------------------------
  const groupAUsers = users.slice(0, 5).map(u => u.ref);
  const groupBUsers = users.slice(5, 10).map(u => u.ref);

  const groupAData = {
    color: "blue",
    createdAt: serverTimestamp(),
    creator: groupAUsers[0],
    group_members: groupAUsers,
    group_name: "Group A",
    updatedAt: serverTimestamp()
  };

  const groupBData = {
    color: "green",
    createdAt: serverTimestamp(),
    creator: groupBUsers[0],
    group_members: groupBUsers,
    group_name: "Group B",
    updatedAt: serverTimestamp()
  };

  const groupARef = await addDoc(collection(db, 'groups'), groupAData);
  const groupBRef = await addDoc(collection(db, 'groups'), groupBData);

  console.log("✔️ Created 2 groups with 5 members each");

  // -----------------------------
  // 3. ASSIGN GROUP REFERENCES TO USERS
  // -----------------------------
  for (let i = 0; i < 5; i++) {
    await updateDoc(users[i].ref, {
      assigned_groups: [groupARef]
    });
  }

  for (let i = 5; i < 10; i++) {
    await updateDoc(users[i].ref, {
      assigned_groups: [groupBRef]
    });
  }

  console.log("✔️ Linked users to groups");

  // -----------------------------
  // 4. CREATE TASKS (3 per user)
  // -----------------------------
  const priorities = ["Low", "Medium", "High"];

  for (const user of users) {
    for (let t = 1; t <= 3; t++) {
      const groupRef = users.indexOf(user) < 5 ? groupARef : groupBRef;

      const taskData = {
        assignees: [user.ref],
        createdAt: serverTimestamp(),
        creator: user.ref,
        description: `Task ${t} for ${user.data.username}`,
        due_date: Timestamp.fromDate(
          new Date(Date.now() + 86400000 * t)
        ),
        group: groupRef,
        is_done: false,
        priority: priorities[(t - 1) % priorities.length],
        updatedAt: serverTimestamp()
      };

      const taskRef = await addDoc(collection(db, 'tasks'), taskData);

      // Add task ref to the user
      await updateDoc(user.ref, {
        assigned_tasks: arrayUnion(taskRef),
        created_tasks: arrayUnion(taskRef)
      });
    }
    
    console.log(`✔️ Created 3 tasks for ${user.data.username}`);
  }

  console.log("✔️ Created 30 tasks (3 per user) and linked them to users");

  // -----------------------------
  // DONE
  // -----------------------------
  console.log("🌱 SEED COMPLETE!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
