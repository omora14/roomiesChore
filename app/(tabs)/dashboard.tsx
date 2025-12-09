import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import GroupCard from "@/components/ui/group-card";
import TaskList from "@/components/ui/task-list";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/database/firebase"; // Ensure db is imported
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUserId } from "@/services/auth";
import {
  getUpcomingTasksScalable,
  getUserData,
  getUserGroupsScalable,
  resolveTaskData,
} from "@/services/database";
import { useFocusEffect, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore"; // Import onSnapshot
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [userId, setUserId] = useState<string>("");
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");
  const [groups, setGroups] = useState<
    { name: string; color: string; id: string }[]
  >([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Track an error for the whole dashboard load
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // USE FOCUS EFFECT: Runs when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      let unsubscribe: (() => void) | undefined;
      let isActive = true; // Prevents state updates if screen unmounts

      const loadDashboardData = async () => {
        try {
          if (isActive) {
            setLoading(true);
            setDashboardError(null);
          }

          const currentUserId = await getCurrentUserId();
          if (isActive) setUserId(currentUserId);

          const [userData, groupsData] = await Promise.all([
            getUserData(currentUserId),
            getUserGroupsScalable(currentUserId),
          ]);

          if (isActive) {
            setUserFirstName(
              userData?.firstName || userData?.username || "User"
            );
            setUserLastName(userData?.lastName || "");
            setGroups(groupsData || []);
          }

          const userDocRef = doc(db, "users", currentUserId);

          unsubscribe = onSnapshot(
            userDocRef,
            async (snapshot) => {
              if (isActive) {
                const tasksData = await getUpcomingTasksScalable(currentUserId);

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
                      priority: task.priority,
                    });
                    return resolvedTask;
                  })
                );

                resolvedTasks.sort((a, b) => {
                  const dateA = a.due_date
                    ? new Date(a.due_date).getTime()
                    : Infinity;
                  const dateB = b.due_date
                    ? new Date(b.due_date).getTime()
                    : Infinity;
                  return dateA - dateB;
                });

                if (isActive) {
                  setTasks(resolvedTasks as Task[]);
                  setLoading(false);
                }
              }
            },
            (error) => {
              console.error("Snapshot error:", error);
              if (isActive) setLoading(false);
            }
          );
        } catch (error) {
          console.error("Error loading dashboard:", error);
          if (isActive) {
            setDashboardError("Failed to load dashboard data.");
            setUserFirstName("User");
            setGroups([]);
            setTasks([]);
            setLoading(false);
          }
        }
      };

      loadDashboardData();

      // Cleanup function when screen loses focus or unmounts
      return () => {
        isActive = false;
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, [])
  );

  // Format current date for display
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>
              Loading dashboard...
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.content}>
          {/* Header section */}
          <View style={styles.header}>
            <ThemedText style={styles.dateText}>{dateString}</ThemedText>
            <ThemedText style={styles.welcomeText}>
              Welcome
              {userFirstName
                ? `, ${userFirstName}${userLastName ? ` ${userLastName}` : ""}`
                : ""}
              !
            </ThemedText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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
                  <ThemedText style={styles.emptyText}>
                    No groups yet. Create one to get started!
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Tasks section */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Upcoming Tasks
              </ThemedText>
              {tasks.length > 0 ? (
                <TaskList tasks={tasks} />
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    No upcoming tasks. You're all caught up!
                  </ThemedText>
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
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  groupsList: {
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  emptyText: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: "center",
  },
});
