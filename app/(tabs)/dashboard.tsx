import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import GroupCard from '@/components/ui/group-card';
import TaskList from '@/components/ui/task-list';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getCurrentUserId } from '@/services/auth';
import { getUpcomingTasksScalable, getUserData, getUserGroupsScalable, resolveTaskData } from '@/services/database';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Interface for task data returned from database
type Task = {
  id: string;
  description: string;
  creator: any;
  assignees: any[];
  group: any;
  due_date: any;
  is_done: boolean;
  createdAt?: any;
  updatedAt?: any;
  priority?: any;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = theme === "dark";

  // State management for dashboard data
  const [userId, setUserId] = useState<string>('');
  const [userFirstName, setUserFirstName] = useState<string>('');
  const [userLastName, setUserLastName] = useState<string>('');
  const [groups, setGroups] = useState<{ name: string, color: string, id: string }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Track an error for the whole dashboard load
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Load dashboard data when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setDashboardError(null);

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
        setUserFirstName(userData?.firstName || userData?.username || 'User');
        setUserLastName(userData?.lastName || '');
        setGroups(groupsData || []);

        // Step 4: Resolve tasks with user and group data using shared utility
        const resolvedTasks = await Promise.all(
          (tasksData || []).map(async (task) => {
            const resolvedTask = await resolveTaskData({
              id: task.id,
              description: task.description,
              creator: task.creator,
              assignees: task.assignees,
              group: task.group,
              due_date: task.due_date,
              is_done: task.is_done,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
              priority: task.priority
            });
            return resolvedTask;
          })
        );

        setTasks(resolvedTasks);

      } catch (error) {
        console.error('Error loading dashboard:', error);

        // Set a user-facing error message
        setDashboardError('Failed to load dashboard data.');

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
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Main dashboard render
  return (

    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.content}>
          {/* Header section with date and welcome message */}
          <View style={styles.header}>
            <ThemedText style={styles.dateText}>{dateString}</ThemedText>
            <ThemedText style={styles.welcomeText}>
              Welcome{userFirstName ? `, ${userFirstName}${userLastName ? ` ${userLastName}` : ''}` : ''}!
            </ThemedText>
          </View>
          <ScrollView>
            {/* Groups section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>My Groups</ThemedText>
              {groups.length > 0 ? (
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
                  contentContainerStyle={styles.groupsList}
                  ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  keyExtractor={(item, index) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No groups yet. Create one to get started!</ThemedText>
                </View>
              )}
            </View>

            {/* Tasks section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Upcoming Tasks</ThemedText>
              {tasks.length > 0 ? (
                <TaskList tasks={tasks} />
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>No upcoming tasks. You're all caught up!</ThemedText>
                </View>
              )}
            </View>
          </ScrollView>
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
  welcomeText: {
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
  groupsList: {
    paddingVertical: 8,
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
