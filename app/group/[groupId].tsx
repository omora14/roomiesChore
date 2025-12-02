import TaskList from '@/components/ui/task-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/database/firebase';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = theme === "dark";
  
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState<string>('Group');
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

  // Load group name
  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;
      
      const loadGroupName = async () => {
        try {
          const groupDocRef = doc(db, "groups", groupId as string);
          const groupDoc = await getDoc(groupDocRef);
          if (groupDoc.exists()) {
            const data = groupDoc.data();
            setGroupName(data.group_name || 'Group');
          }
        } catch (error) {
          console.error('Error loading group name:', error);
        }
      };
      
      loadGroupName();
    }, [groupId])
  );

  useFocusEffect(
    useCallback(() => {
      if (!groupId) return;

      const tasksReference = collection(db, "tasks");
      const groupDocRef = doc(db, "groups", groupId as string);
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
        setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId])

);
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>Loading group...</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.dateText}>{dateString}</ThemedText>
            <ThemedText style={styles.groupName}>{groupName}</ThemedText>
          </View>

          {/* Individual Tasks Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Individual Tasks</ThemedText>
            {individualTasks.length > 0 ? (
              <TaskList tasks={individualTasks} />
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No individual tasks assigned to you.</ThemedText>
              </View>
            )}
          </View>
    <SafeAreaView style={{flex: 1, backgroundColor: 'white', padding: 10,}}>
      <ScrollView>
    <Text style={{ marginTop: 20 }}>{dateString}</Text>

          {/* Group Tasks Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Group Tasks</ThemedText>
            {groupTasks.length > 0 ? (
              <TaskList tasks={groupTasks} />
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No group tasks yet.</ThemedText>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    marginBottom: 32,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
  },
});
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
      </ScrollView>
  </SafeAreaView>
);
}
