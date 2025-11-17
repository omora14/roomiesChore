import { db } from '@/database/firebase';
import { doc, DocumentReference, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

/**
 * TypeScript interfaces for type safety
 */
interface UserData {
  username: string;
  email: string;
  createdAt: Timestamp;
  created_tasks: (DocumentReference | string)[];
  assigned_tasks: (DocumentReference | string)[];
  assigned_groups: (DocumentReference | string)[];
}

interface GroupData {
  group_name: string;
  color: string;
  group_members: DocumentReference[];
  creator: DocumentReference;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface TaskData {
  description: string;
  creator: DocumentReference;
  assignees: DocumentReference[];
  group: DocumentReference;
  due_date: Timestamp;
  is_done: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Fetches user data from Firestore
 * @param userId - The unique user ID
 * @returns User data object or undefined if not found
 */
export const getUserData = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    return userDoc.data() as UserData | undefined;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Fetches user's groups using scalable approach (from user's assigned_groups field)
 * This approach scales better than querying all groups and filtering
 * @param userId - The unique user ID
 * @returns Array of group objects with id, name, and color
 */
export const getUserGroupsScalable = async (userId: string) => {
  try {
    console.log('Fetching groups scalably for user:', userId);
    
    // Get user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as UserData | undefined;
    
    console.log('User data for groups:', userData);
    
    const assignedGroupRef = userData?.assigned_groups;
    
    // Check if user has any assigned groups
    if (!assignedGroupRef) {
      console.log('No assigned groups found');
      return [];
    }
    
    // Handle case where assigned_groups is an array
    if (Array.isArray(assignedGroupRef)) {
      const groupPromises = assignedGroupRef.map(async (groupRef: DocumentReference | string) => {
        const groupDoc = typeof groupRef === 'string'
          ? await getDoc(doc(db, 'groups', groupRef))
          : await getDoc(groupRef);
        
        if (groupDoc.exists()) {
          const data = groupDoc.data() as GroupData;
          return {
            id: groupDoc.id,
            name: data.group_name,
            color: data.color,
          };
        }
        return null;
      });
      
      const groups = (await Promise.all(groupPromises)).filter(group => group !== null);
      return groups;
    }
    
    // Handle case where assigned_groups is a single reference
    const groupDoc = typeof assignedGroupRef === 'string'
      ? await getDoc(doc(db, 'groups', assignedGroupRef))
      : await getDoc(assignedGroupRef);
    
    if (groupDoc.exists()) {
      const data = groupDoc.data() as GroupData;
      return [{
        id: groupDoc.id,
        name: data.group_name,
        color: data.color,
      }];
    }
    
    return [];
    
  } catch (error) {
    console.error('Error fetching groups scalably:', error);
    return [];
  }
};

/**
 * Fetches user's tasks using scalable approach (from user's assigned_tasks field)
 * Only returns incomplete tasks, sorted by due date
 * @param userId - The unique user ID
 * @returns Array of task objects with id and title
 */
export const getUpcomingTasksScalable = async (userId: string) => {
  try {
    console.log('Fetching tasks scalably for user:', userId);
    
    // Get user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as UserData | undefined;
    
    console.log('User data for tasks:', userData);
    
    const assignedTaskRefs = userData?.assigned_tasks;
    
    // Check if user has any assigned tasks
    if (!assignedTaskRefs || !Array.isArray(assignedTaskRefs) || assignedTaskRefs.length === 0) {
      console.log('No assigned tasks found or assigned_tasks is not an array');
      return [];
    }
    
    // Fetch each task document
    const taskPromises = assignedTaskRefs.map(async (taskRef: DocumentReference | string) => {
      const taskDoc = typeof taskRef === 'string'
        ? await getDoc(doc(db, 'tasks', taskRef))
        : await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        const data = taskDoc.data() as TaskData;
        
        // Only return incomplete tasks
        if (!data.is_done) {
          return {
            id: taskDoc.id,
            description: data.description || 'Untitled Task',
            creator: data.creator,
            assignees: data.assignees,
            group: data.group,
            due_date: data.due_date,
            is_done: data.is_done,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }
      }
      return null;
    });
    
    // Filter out null values and sort
    const tasks = (await Promise.all(taskPromises)).filter(task => task !== null);
    console.log('Scalable tasks:', tasks);
    
    return tasks;
    
  } catch (error) {
    console.error('Error fetching tasks scalably:', error);
    return [];
  }
};

/**
 * Creates a new user document in Firestore with the updated schema
 * @param userId - The unique user ID from Firebase Auth
 * @param userData - Object containing email and username
 */
export const createUserDocument = async (userId: string, userData: { email: string, username: string }) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    
    await setDoc(userDocRef, {
      email: userData.email,
      username: userData.username,
      createdAt: serverTimestamp(),
      created_tasks: [],      // Tasks created by this user
      assigned_tasks: [],     // Tasks assigned to this user  
      assigned_groups: [],    // Groups this user belongs to
    });
    
    console.log('User document created successfully');
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};
