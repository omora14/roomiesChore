import { db } from '@/database/firebase';
import { addDoc, arrayUnion, collection, doc, DocumentReference, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';

/**
 * TypeScript interfaces for type safety
 */
interface UserData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
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
  priority: string;
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
            due_date: data.due_date?.toDate(), // Convert Timestamp to Date
            is_done: data.is_done,
            createdAt: data.createdAt?.toDate(), // Convert Timestamp to Date
            updatedAt: data.updatedAt?.toDate(), // Convert Timestamp to Date
            priority: data.priority || 'None',
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
 * @param userData - Object containing email, username, firstName, and lastName
 */
export const createUserDocument = async (userId: string, userData: { email: string, username: string, firstName: string, lastName: string }) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    await setDoc(userDocRef, {
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
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

/**
 * Fetches members of a specific group
 * @param groupId - The unique group ID
 * @returns Array of member objects with id, firstName, and lastName
 */
export const getGroupMembers = async (groupId: string) => {
  try {
    console.log('Fetching members for group:', groupId);

    // Get group document
    const groupDocRef = doc(db, 'groups', groupId);
    const groupDoc = await getDoc(groupDocRef);

    if (!groupDoc.exists()) {
      console.log('Group not found');
      return [];
    }

    const groupData = groupDoc.data() as GroupData;
    const memberRefs = groupData.group_members;

    if (!memberRefs || memberRefs.length === 0) {
      console.log('No members in this group');
      return [];
    }

    // Fetch each member's user document
    const memberPromises = memberRefs.map(async (memberRef: DocumentReference) => {
      const memberDoc = await getDoc(memberRef);

      if (memberDoc.exists()) {
        const userData = memberDoc.data() as UserData;
        return {
          id: memberDoc.id,
          name: `${userData.firstName} ${userData.lastName}`, // Display as "First Last"
          firstName: userData.firstName,
          lastName: userData.lastName,
        };
      }
      return null;
    });

    const members = (await Promise.all(memberPromises)).filter(member => member !== null);
    console.log('Group members:', members);

    return members;

  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};

/**
 * Creates a new task in Firestore and updates user documents
 * @param taskData - Object containing all task information
 * @returns The ID of the created task
 */
export const createTask = async (taskData: {
  description: string;
  creator: string;
  assignees: string[];
  group: string;
  due_date: string;
  priority?: string;
}) => {
  try {
    console.log('Creating task with data:', taskData);

    // Convert string IDs to DocumentReferences
    const creatorRef = doc(db, 'users', taskData.creator);
    const assigneeRefs = taskData.assignees.map(id => doc(db, 'users', id));
    const groupRef = doc(db, 'groups', taskData.group);

    // Convert date string to Timestamp
    const dueDate = taskData.due_date
      ? Timestamp.fromDate(new Date(taskData.due_date))
      : null;

    // Create task document
    const taskDocRef = await addDoc(collection(db, 'tasks'), {
      description: taskData.description,
      creator: creatorRef,
      assignees: assigneeRefs,
      group: groupRef,
      due_date: dueDate,
      is_done: false,
      priority: taskData.priority || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Task created with ID:', taskDocRef.id);

    // Update assignee's assigned_tasks array - STORE REFERENCE, NOT STRING
    for (const assigneeId of taskData.assignees) {
      const assigneeDocRef = doc(db, 'users', assigneeId);
      const taskReference = doc(db, 'tasks', taskDocRef.id); // Create reference
      await updateDoc(assigneeDocRef, {
        assigned_tasks: arrayUnion(taskReference) // Store reference instead of ID
      });
    }

    // Update creator's created_tasks array - STORE REFERENCE, NOT STRING
    const creatorDocRef = doc(db, 'users', taskData.creator);
    const taskReference = doc(db, 'tasks', taskDocRef.id); // Create reference
    await updateDoc(creatorDocRef, {
      created_tasks: arrayUnion(taskReference) // Store reference instead of ID
    });

    console.log('User documents updated successfully');

    return taskDocRef.id;

  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Resolves a user DocumentReference to user data with display name
 * @param userRef - DocumentReference or string ID of the user
 * @returns User object with id, firstName, lastName, email, and name
 */
export const resolveUserData = async (userRef: DocumentReference | string) => {
  try {
    const userDoc = typeof userRef === 'string'
      ? await getDoc(doc(db, 'users', userRef))
      : await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      return {
        id: userDoc.id,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        username: userData.username || '',
        name: fullName || userData.email || 'Unknown User'
      };
    }
    return null;
  } catch (error) {
    console.error('Error resolving user data:', error);
    return null;
  }
};

/**
 * Resolves a group DocumentReference to group data with display name
 * @param groupRef - DocumentReference or string ID of the group
 * @returns Group object with id, name, group_name, and color
 */
export const resolveGroupData = async (groupRef: DocumentReference | string) => {
  try {
    const groupDoc = typeof groupRef === 'string'
      ? await getDoc(doc(db, 'groups', groupRef))
      : await getDoc(groupRef);

    if (groupDoc.exists()) {
      const data = groupDoc.data() as GroupData;
      const groupName = data.group_name || 'Uncategorized';
      return {
        id: groupDoc.id,
        name: groupName,
        group_name: groupName,
        color: data.color || ''
      };
    }
    return { id: typeof groupRef === 'string' ? groupRef : 'unknown', name: 'Uncategorized', group_name: 'Uncategorized', color: '' };
  } catch (error) {
    console.error('Error resolving group data:', error);
    return { id: typeof groupRef === 'string' ? groupRef : 'unknown', name: 'Uncategorized', group_name: 'Uncategorized', color: '' };
  }
};

/**
 * Resolves a task with all user and group data populated
 * @param taskData - Raw task data from Firestore with DocumentReferences
 * @returns Task object with resolved user and group data
 */
export const resolveTaskData = async (taskData: {
  id: string;
  description?: string;
  creator?: DocumentReference | string;
  assignees?: (DocumentReference | string)[];
  group?: DocumentReference | string;
  due_date?: any;
  is_done?: boolean;
  createdAt?: any;
  updatedAt?: any;
  priority?: any;
}) => {
  // Resolve assignees
  let assignees: Array<{ id: string; name: string; firstName: string; lastName: string; email: string }> = [];
  if (taskData.assignees && Array.isArray(taskData.assignees) && taskData.assignees.length > 0) {
    const assigneePromises = taskData.assignees.map(ref => resolveUserData(ref));
    const assigneeResults = await Promise.all(assigneePromises);
    assignees = assigneeResults
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: user.name
      }));
  }

  // Resolve creator
  let creator = { id: 'unknown', name: 'Unknown', firstName: '', lastName: '', email: '' };
  if (taskData.creator) {
    const creatorData = await resolveUserData(taskData.creator);
    if (creatorData) {
      creator = {
        id: creatorData.id,
        name: creatorData.name,
        firstName: creatorData.firstName,
        lastName: creatorData.lastName,
        email: creatorData.email
      };
    }
  }

  // Resolve group
  let group = { id: 'uncategorized', name: 'Uncategorized', group_name: 'Uncategorized', color: '' };
  if (taskData.group) {
    const fetchedGroup = await resolveGroupData(taskData.group);
    group = {
      id: fetchedGroup.id,
      name: fetchedGroup.group_name,
      group_name: fetchedGroup.group_name,
      color: fetchedGroup.color
    };
  }

  return {
    id: taskData.id,
    description: taskData.description || 'Untitled Task',
    creator,
    assignees,
    group,
    due_date: taskData.due_date?.toDate?.()?.toISOString() || (taskData.due_date instanceof Date ? taskData.due_date.toISOString() : taskData.due_date || new Date().toISOString()),
    is_done: taskData.is_done || false,
    createdAt: taskData.createdAt,
    updatedAt: taskData.updatedAt,
    priority: taskData.priority
  };
};