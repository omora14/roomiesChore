import { getCurrentUserId } from "@/services/auth";
import { createTask, getGroupMembers, getUserGroupsScalable } from "@/services/database";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Interface for creating a new task
interface CreateTaskData {
  description: string;        // Task title/description
  creator: string;           // User ID of creator
  assignees: string[];       // Array of user IDs assigned to task
  group: string;             // Group ID where task belongs
  due_date: string;          // Date in YYYY-MM-DD format (will convert to Timestamp)
  is_done: boolean;          // Completion status (always false for new tasks)
  priority?: string;         // Optional: Low, Medium, High
}

export default function AddTaskScreen() {
  const router = useRouter(); // Navigation hook

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  
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
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Create Task</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Task Details</Text>

        <View style={styles.card}>
          {/* TITLE */}
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Take out the trash"
            value={title}
            onChangeText={setTitle}
          />
          {errors.title ? (
            <Text style={styles.errorText}>{errors.title}</Text>
          ) : null}

          {/* DESCRIPTION */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* GROUP DROPDOWN */}
          <Text style={styles.label}>Group *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowGroupDropdown(!showGroupDropdown)}
            disabled={loading}
          >
            <Text>
              {loading 
                ? "Loading groups..."
                : groupId
                ? groupOptions.find((g) => g.id === groupId)?.name
                : "Select a group"}
            </Text>
          </TouchableOpacity>

          {errors.groupId ? (
            <Text style={styles.errorText}>{errors.groupId}</Text>
          ) : null}

          {showGroupDropdown && (
            <View style={styles.dropdown}>
              {groupOptions.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={styles.dropdownItem}
                  onPress={() => handleGroupSelection(g.id)}
                >
                  <Text>{g.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ASSIGNEE DROPDOWN */}
          <Text style={styles.label}>Assignee *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            disabled={!groupId || assigneOptions.length === 0}
          >
            <Text>
              {!groupId
                ? "Select a group first"
                : assigneeId
                ? assigneOptions.find((a) => a.id === assigneeId)?.name
                : assigneOptions.length === 0
                ? "No members in this group"
                : "Select an assignee"}
            </Text>
          </TouchableOpacity>

          {errors.assigneeId ? (
            <Text style={styles.errorText}>{errors.assigneeId}</Text>
          ) : null}

          {showAssigneeDropdown && (
            <View style={styles.dropdown}>
              {assigneOptions.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAssignee(a.id);
                    setShowAssigneeDropdown(false);
                  }}
                >
                  <Text>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* DUE DATE */}
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={(text) => setDueDate(formatDate(text))}
            maxLength={10}
            keyboardType="numeric"
          />

          {/* PRIORITY DROPDOWN */}
          <Text style={styles.label}>Priority</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
          >
            <Text>{priority ? priority : "Select Priority"}</Text>
          </TouchableOpacity>

          {showPriorityDropdown && (
            <View style={styles.dropdown}>
              {["Low", "Medium", "High"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setPriority(level);
                    setShowPriorityDropdown(false);
                  }}
                >
                  <Text>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            )}
            </View>
            
        {/* BUTTON */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "blue" }]}
          onPress={handleAddTask}
        >
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomColor: "#e5e5e5",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "white",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "white",
    marginTop: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#0A7EA4",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});