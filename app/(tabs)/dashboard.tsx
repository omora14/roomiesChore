import { ThemedText } from '@/components/themed-text';
import GroupCard from '@/components/ui/group-card';
import TaskList from '@/components/ui/task-list';
import { getCurrentUserId } from '@/services/auth';
import { getUpcomingTasksScalable, getUserData, getUserGroupsScalable } from '@/services/database';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface for task data returned from database
type Task = {
  id: string;
  // title: string;
  description?: string;
  creator?: any;
  assignees?: any[];
  group?: any;
  due_date?: any;
  is_done?: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export default function DashboardScreen() {
  const router = useRouter();

  // State management for dashboard data
  const [userId, setUserId] = useState<string>('');
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [groups, setGroups] = useState<{ name: string, color: string, id: string}[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]); 
  const [loading, setLoading] = useState(true);

  // Load dashboard data when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get current authenticated user ID
        const currentUserId = await getCurrentUserId();
        console.log('Current User ID:', currentUserId);
        setUserId(currentUserId);
        
        // Step 2: Fetch all user data in parallel for better performance
        const [userData, groupsData, tasksData] = await Promise.all([
          getUserData(currentUserId),              // User profile data
          getUserGroupsScalable(currentUserId),    // User's groups
          getUpcomingTasksScalable(currentUserId)  // User's incomplete tasks
        ]);
        
        // Debug logging
        console.log('User Data:', userData);
        console.log('Groups Data:', groupsData);
        console.log('Tasks Data:', tasksData);
        
        // Step 3: Update state with fetched data
        setUserFirstName(userData?.username || 'User');
        setGroups(groupsData || []);
        
        // Convert tasks for TaskList component (expects numeric IDs)
        // const mappedTasks = (tasksData || []).map((task, index) => ({
        //   id: index + 1, // Convert string ID to number for component compatibility
        //   title: task.title
        // }));
        // setTasks(mappedTasks);

        setTasks(tasksData || []);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        
        // Set fallback values on error
        setUserFirstName('User');
        setGroups([]);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Format current date for display
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
  });

  // Show loading screen while fetching data
  if (loading) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white', padding: 10}}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Main dashboard render
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white', padding: 10}}>
      
      {/* Header section with date and welcome message */}
      <Text style={{ marginTop: 20 }}>
        {dateString}
      </Text>

      <Text style={{fontWeight: 'bold', fontSize: 25, marginTop: 30}}>
        Welcome {userFirstName}!
      </Text>

      {/* Groups section */}
      <View>
        <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
          My Groups
        </Text>

        {/* Horizontal scrolling list of group cards */}
        <FlatList
          horizontal
          data={groups}
          renderItem={({ item }) => (
            <GroupCard 
              name={item.name} 
              color={item.color} 
              id={item.id} 
              onPress={() => router.push(`/group/${item.id}`)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <ThemedText>No groups yet!</ThemedText>
          }
        />
      </View>

      {/* Tasks section */}
      <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
        Upcoming Tasks
      </Text>
      
      <TaskList tasks={tasks} />
      
    </SafeAreaView>
  );
}
