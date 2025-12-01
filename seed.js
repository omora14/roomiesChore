/**
 * SEED SCRIPT FOR FIRESTORE
 * Creates:
 * - 10 users
 * - 2 groups (5 users per group)
 * - 30 tasks (3 per user)
 */

import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Utility for timestamps
const now = admin.firestore.Timestamp.now();

async function seed() {
  console.log("Starting seed...");

  // -----------------------------
  // 1. CREATE USERS
  // -----------------------------
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const userRef = db.collection("users").doc();
    const user = {
      assigned_groups: [],       // fill later
      assigned_tasks: [],        // fill later
      createdAt: now,
      created_tasks: [],
      email: `user${i}@example.com`,
      firstName: `User${i}`,
      lastName: `Test${i}`,
      username: `user${i}`
    };

    users.push({ id: userRef.id, ref: userRef, data: user });
  }

  // Write users
  for (const u of users) await u.ref.set(u.data);
  console.log("✔️ Created 10 users");


  // -----------------------------
  // 2. CREATE 2 GROUPS (5 users each)
  // -----------------------------
  const groupARef = db.collection("groups").doc();
  const groupBRef = db.collection("groups").doc();

  const groupAUsers = users.slice(0, 5).map(u => u.ref);
  const groupBUsers = users.slice(5, 10).map(u => u.ref);

  const groupA = {
    color: "blue",
    createdAt: now,
    creator: groupAUsers[0],
    group_members: groupAUsers,
    group_name: "Group A",
    updatedAt: now
  };

  const groupB = {
    color: "green",
    createdAt: now,
    creator: groupBUsers[0],
    group_members: groupBUsers,
    group_name: "Group B",
    updatedAt: now
  };

  await groupARef.set(groupA);
  await groupBRef.set(groupB);

  console.log("✔️ Created 2 groups with 5 members each");


  // -----------------------------
  // 3. ASSIGN GROUP REFERENCES TO USERS
  // -----------------------------
  for (let i = 0; i < 5; i++) {
    await users[i].ref.update({
      assigned_groups: [groupARef]
    });
  }

  for (let i = 5; i < 10; i++) {
    await users[i].ref.update({
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
      const taskRef = db.collection("tasks").doc();

      const groupRef = user.data.assigned_groups[0] || // fallback
                       (users.indexOf(user) < 5 ? groupARef : groupBRef);

      const task = {
        assignees: [user.ref],
        createdAt: now,
        creator: user.ref,
        description: `Task ${t} for ${user.data.username}`,
        due_date: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 86400000 * t)
        ),
        group: groupRef,
        is_done: false,
        priority: priorities[(t - 1) % priorities.length],
        updatedAt: now
      };

      await taskRef.set(task);

      // Add task ref to the user
      await user.ref.update({
        assigned_tasks: admin.firestore.FieldValue.arrayUnion(taskRef),
        created_tasks: admin.firestore.FieldValue.arrayUnion(taskRef)
      });
    }
  }

  console.log("✔️ Created 30 tasks (3 per user) and linked them to users");


  // -----------------------------
  // DONE
  // -----------------------------
  console.log("🌱 SEED COMPLETE!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
});
