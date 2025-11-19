import TaskList from '@/components/ui/task-list';
import { auth, db } from '@/database/firebase';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface for task data returned from database
type Task = {
  id: string;
  // title: string;
  description: string;
  creator: any;
  assignees: any[];
  group: any;
  due_date: any;
  is_done: boolean;
  createdAt: any;
  updatedAt: any;
}


export default function GroupScreen() {
  
  const [loading, setLoading] = useState(true);
  const [groupTasks, setGroupTasks] = useState<Task[]>([]);
  const [individualTasks, setIndividualTasks] = useState<Task[]>([]);
  
  const { groupId } = useLocalSearchParams();
  const userId = auth.currentUser?.uid
  
  const currentDate: Date = new Date();
  
  const dateString: string = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  
  // Change to retrieve group tasks from database.
  
  
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      
      const tasksReference = collection(db, "tasks");
      const userDocRef = doc(db, "users", userId);
      const individualTaskQuery = query(tasksReference, where('assignees', 'array-contains', userDocRef));
      const unsubscribe = onSnapshot(individualTaskQuery, (snapshot) => {
        const individualTasks = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<Task, 'id'>;
          return { 
            id: doc.id,
            description: data.description,
            creator: data.creator,
            assignees: data.assignees,
            group: data.group,
            is_done: data.is_done,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            due_date: data.due_date?.toDate(), 
          };
        });
        setIndividualTasks(individualTasks);

    });

    return () => unsubscribe();
  }, [userId])

);

  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;

      const tasksReference = collection(db, "tasks");
      const groupDocRef = doc(db, "group", groupId as string);
      const groupTaskQuery = query(tasksReference, where('group', '==', groupDocRef));
      const unsubscribe = onSnapshot(groupTaskQuery, (snapshot) => {
        const groupTasks = snapshot.docs.map(doc => {
        const data = doc.data() as Omit<Task, 'id'>;
          return { 
            id: doc.id,
            description: data.description,
            creator: data.creator,
            assignees: data.assignees,
            group: data.group,
            is_done: data.is_done,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            due_date: data.due_date?.toDate(), 
          };
        });
        setGroupTasks(groupTasks);
    });

    return () => unsubscribe();
  }, [groupId])

);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white', padding: 10,}}>

    <Text style={{ marginTop: 20 }}>{dateString}</Text>

    <Text style={{fontWeight: 'bold', fontSize: 25, marginTop: 30}}>
      {/* Replace with actual group name */}
    Group Name
    </Text>

    <View>
    <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
      Individual Tasks
    </Text>
    {/* Create scrollable list of tasks for entire group */}
      <TaskList tasks={individualTasks} />
      </View>
    <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
      Group Tasks
    </Text>
      <TaskList tasks={groupTasks}/>
  </SafeAreaView>
);
}