import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUserId } from "@/services/auth";
import { createTask, getGroupMembers, getUserGroupsScalable } from "@/services/database";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Interface for task
interface TaskData {
  description: string;        // Task title/description
  creator: string;           // User ID of creator
  assignees: string[];       // Array of user IDs assigned to task
  group: string;             // Group ID where task belongs
  due_date: string;          // Date in YYYY-MM-DD format (will convert to Timestamp)
  is_done: boolean;          // Completion status (always false for new tasks)
  priority?: string;         // Optional: Low, Medium, High
}

interface TaskFormProps {
    initialTaskData?: Partial<TaskData>;
    onSubmit: (data: TaskData) => void;
    pageHeading?: string;
    showDeleteButton?: boolean;
}

export default function TaskForm({ initialTaskData, onSubmit, pageHeading, showDeleteButton }: TaskFormProps) {
  const router = useRouter(); // Navigation hook
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = theme === "dark";

  const [title, setTitle] = useState(initialTaskData?.description || "");
//   const [description, setDescription] = useState(initialTaskData?.description || "");
  const [assigneeId, setAssignee] = useState(initialTaskData?.assignees?.[0] || "");
  const [dueDate, setDueDate] = useState(initialTaskData?.due_date ? new Date(initialTaskData?.due_date).toISOString().split("T")[0] : "");
  const [priority, setPriority] = useState(initialTaskData?.priority || "");
  const [submitting, setSubmitting] = useState(false);
  
  // Dynamic state for groups and assignees
  const [groupOptions, setGroupOptions] = useState<{ id: string; name: string; color?: string }[]>([]);
  const [assigneOptions, setAssigneOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupId, setGroupId] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({
    title: "",
    assigneeId: "",
    groupId: "",
  });

  // Load user's groups on component mount
  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        setLoading(true);
        const currentUserId = await getCurrentUserId();
        const userGroups = await getUserGroupsScalable(currentUserId);
        setGroupOptions(userGroups);
      } catch (error) {
        console.error('Error loading groups:', error);
        Alert.alert('Error', 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    loadUserGroups();
  }, []);

  // Handle group selection and load members
  const handleGroupSelection = async (selectedGroupId: string) => {
    setGroupId(selectedGroupId);
    setShowGroupDropdown(false);
    
    try {
      // Fetch members of the selected group
      const members = await getGroupMembers(selectedGroupId);
      setAssigneOptions(members);
      
      // Reset assignee since group changed
      setAssignee("");
    } catch (error) {
      console.error('Error loading group members:', error);
      Alert.alert('Error', 'Failed to load group members');
    }
  };

  // Auto-format YYYY-MM-DD
  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 4 && cleaned.length <= 6) {
      formatted = cleaned.slice(0, 4) + "-" + cleaned.slice(4);
    } else if (cleaned.length > 6) {
      formatted =
        cleaned.slice(0, 4) +
        "-" +
        cleaned.slice(4, 6) +
        "-" +
        cleaned.slice(6, 8);
    }

    return formatted;
  };

  // Handle Add Task
  const handleAddTask = async () => {
    let newErrors = { title: "", assigneeId: "", groupId: "" };
    let hasError = false;

    if (!title.trim()) {
      newErrors.title = "Title is required.";
      hasError = true;
    }
    if (!assigneeId.trim()) {
      newErrors.assigneeId = "Assignee is required.";
      hasError = true;
    }
    if (!groupId.trim()) {
      newErrors.groupId = "You must select a group.";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    setSubmitting(true);
    try {
      // Get current user as creator
      const currentUserId = await getCurrentUserId();
      
      // Create task in Firestore
      const taskId = await createTask({
        description: title,
        creator: currentUserId,
        assignees: [assigneeId],
        group: groupId,
        due_date: dueDate,
        priority: priority,
      });

      console.log("Task created successfully with ID:", taskId);
      
      Alert.alert("Success", "Task created successfully!");

      // Navigate back to Tasks tab
      setTimeout(() => {
        router.replace("/(tabs)/tasksScreen");
      }, 500);
      
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

    function handleDeleteTask(event: GestureResponderEvent): void {
        throw new Error("Function not implemented.");
    }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>{pageHeading}</ThemedText>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.sectionTitle}>Task Details</ThemedText>

          <View style={[
            styles.card,
            {
              backgroundColor: isDark ? '#2a2a2a' : '#fafafa',
              borderColor: isDark ? '#3a3a3a' : '#e0e0e0',
            }
          ]}>
          {/* TITLE */}
          <ThemedText style={styles.label}>Task Title *</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                color: textColor,
                borderColor: errors.title ? '#ff3b30' : (isDark ? '#444' : '#ccc'),
              }
            ]}
            placeholder="e.g. Take out the trash"
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={title}
            onChangeText={setTitle}
          />
          {errors.title ? (
            <ThemedText style={styles.errorText}>{errors.title}</ThemedText>
          ) : null}

          {/* GROUP DROPDOWN */}
          <ThemedText style={styles.label}>Group *</ThemedText>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dropdownButton,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                borderColor: errors.groupId ? '#ff3b30' : (isDark ? '#444' : '#ccc'),
              }
            ]}
            onPress={() => setShowGroupDropdown(!showGroupDropdown)}
            disabled={loading}
          >
            <ThemedText style={{ color: loading ? (isDark ? '#666' : '#999') : textColor }}>
              {loading 
                ? "Loading groups..."
                : groupId
                ? groupOptions.find((g) => g.id === groupId)?.name
                : "Select a group"}
            </ThemedText>
            <MaterialIcons 
              name={showGroupDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={20} 
              color={isDark ? '#666' : '#999'} 
            />
          </TouchableOpacity>

          {errors.groupId ? (
            <ThemedText style={styles.errorText}>{errors.groupId}</ThemedText>
          ) : null}

          {showGroupDropdown && (
            <View style={[
              styles.dropdown,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                borderColor: isDark ? '#444' : '#ccc',
              }
            ]}>
              {groupOptions.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: isDark ? '#333' : '#eee' }
                  ]}
                  onPress={() => handleGroupSelection(g.id)}
                >
                  <ThemedText>{g.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ASSIGNEE DROPDOWN */}
          <ThemedText style={styles.label}>Assignee *</ThemedText>
          <TouchableOpacity
            style={[
              styles.input,
              styles.dropdownButton,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                borderColor: errors.assigneeId ? '#ff3b30' : (isDark ? '#444' : '#ccc'),
                opacity: (!groupId || assigneOptions.length === 0) ? 0.5 : 1,
              }
            ]}
            onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            disabled={!groupId || assigneOptions.length === 0}
          >
            <ThemedText style={{ color: (!groupId || assigneOptions.length === 0) ? (isDark ? '#666' : '#999') : textColor }}>
              {!groupId
                ? "Select a group first"
                : assigneeId
                ? assigneOptions.find((a) => a.id === assigneeId)?.name
                : assigneOptions.length === 0
                ? "No members in this group"
                : "Select an assignee"}
            </ThemedText>
            <MaterialIcons 
              name={showAssigneeDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={20} 
              color={isDark ? '#666' : '#999'} 
            />
          </TouchableOpacity>

          {errors.assigneeId ? (
            <ThemedText style={styles.errorText}>{errors.assigneeId}</ThemedText>
          ) : null}

          {showAssigneeDropdown && (
            <View style={[
              styles.dropdown,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                borderColor: isDark ? '#444' : '#ccc',
              }
            ]}>
              {assigneOptions.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: isDark ? '#333' : '#eee' }
                  ]}
                  onPress={() => {
                    setAssignee(a.id);
                    setShowAssigneeDropdown(false);
                  }}
                >
                  <ThemedText>{a.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* DUE DATE */}
          <ThemedText style={styles.label}>Due Date</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                color: textColor,
                borderColor: isDark ? '#444' : '#ccc',
              }
            ]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={dueDate}
            onChangeText={(text) => setDueDate(formatDate(text))}
            maxLength={10}
            keyboardType="numeric"
          />

          {/* PRIORITY DROPDOWN */}
          <ThemedText style={styles.label}>Priority</ThemedText>

          <TouchableOpacity
            style={[
              styles.input,
              styles.dropdownButton,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                borderColor: isDark ? '#444' : '#ccc',
              }
            ]}
            onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
          >
            <ThemedText style={{ color: priority ? textColor : (isDark ? '#666' : '#999') }}>
              {priority ? priority : "Select Priority"}
            </ThemedText>
            <MaterialIcons 
              name={showPriorityDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={20} 
              color={isDark ? '#666' : '#999'} 
            />
          </TouchableOpacity>

          {showPriorityDropdown && (
            <View style={[
              styles.dropdown,
              {
                backgroundColor: isDark ? '#1a1a1a' : 'white',
                borderColor: isDark ? '#444' : '#ccc',
              }
            ]}>
              {["Low", "Medium", "High"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.dropdownItem,
                    { borderBottomColor: isDark ? '#333' : '#eee' }
                  ]}
                  onPress={() => {
                    setPriority(level);
                    setShowPriorityDropdown(false);
                  }}
                >
                  <ThemedText>{level}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            )}
            </View>
            
        {/* BUTTON */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: tintColor },
            submitting && styles.buttonDisabled
          ]}
          onPress={handleAddTask}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="add-task" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
            </>
          )}
        </TouchableOpacity>
        {/* DELETE BUTTON */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            submitting && styles.buttonDisabled
          ]}
          onPress={handleDeleteTask}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="delete" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Delete Task</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </ThemedView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#ff3b30",
  }
});