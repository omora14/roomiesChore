import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUserId } from "@/services/auth";
import { createTask, getGroupMembers, getUserGroupsScalable } from "@/services/database";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Interface for creating a new task
interface CreateTaskData {
  description: string;
  creator: string;
  assignees: string[];
  group: string;
  due_date: string;
  is_done: boolean;
  priority?: string;
}

export default function AddTaskScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = theme === "dark";

  const [title, setTitle] = useState("");
  const [assigneeId, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [groupOptions, setGroupOptions] = useState<{ id: string; name: string; color?: string }[]>([]);
  const [assigneOptions, setAssigneOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupId, setGroupId] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const [errors, setErrors] = useState({
    title: "",
    assigneeId: "",
    groupId: "",
  });

  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Load groups
  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        setLoading(true);
        const currentUserId = await getCurrentUserId();
        const userGroups = await getUserGroupsScalable(currentUserId);
        setGroupOptions(userGroups);
      } catch (error) {
        console.error("Error loading groups:", error);
        Alert.alert("Error", "Failed to load groups");
      } finally {
        setLoading(false);
      }
    };

    loadUserGroups();
  }, []);

  // Load members when group changes
  const handleGroupSelection = async (selectedGroupId: string) => {
    setGroupId(selectedGroupId);
    setShowGroupDropdown(false);

    setMembersLoading(true);
    setMembersError(null);

    try {
      const members = await getGroupMembers(selectedGroupId);
      setAssigneOptions(members);
      setAssignee("");
    } catch (error) {
      console.error("Error loading group members:", error);
      setMembersError("Failed to load group members.");
      Alert.alert("Error", "Failed to load group members");
    } finally {
      setMembersLoading(false);
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
      const currentUserId = await getCurrentUserId();

      const taskId = await createTask({
        description: title,
        creator: currentUserId,
        assignees: [assigneeId],
        group: groupId,
        due_date: dueDate,
        priority: priority,
      });

      console.log("Task created:", taskId);
      Alert.alert("Success", "Task created successfully!");

      // RESET FORM FIELDS HERE
    setTitle("");
    setAssignee("");
    setGroupId("");
    setDueDate("");
    setPriority("");

    setAssigneOptions([]);
    setShowGroupDropdown(false);
    setShowAssigneeDropdown(false);
    setShowPriorityDropdown(false);

    setErrors({ title: "", assigneeId: "", groupId: "" });

    // Redirect after small delay
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle}>Create Task</ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: isDark ? "#2a2a2a" : "#fafafa" },
                    ]}
          >
            {/* TITLE */}
            <ThemedText style={styles.label}>Task Title *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: errors.title ? "#ff3b30" : isDark ? "#444" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  color: textColor,
                },
              ]}
              placeholder="e.g. Take out the trash"
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title ? <ThemedText style={styles.errorText}>{errors.title}</ThemedText> : null}

            {/* GROUP */}
            <ThemedText style={styles.label}>Group *</ThemedText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  borderColor: errors.groupId ? "#ff3b30" : isDark ? "#444" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                },
              ]}
              onPress={() => setShowGroupDropdown(!showGroupDropdown)}
              disabled={loading}
            >
              <ThemedText style={{ color: loading ? (isDark ? "#666" : "#999") : textColor }}>
                {loading
                  ? "Loading groups..."
                  : groupId
                  ? groupOptions.find((g) => g.id === groupId)?.name
                  : "Select a group"}
              </ThemedText>

              <MaterialIcons
                name={showGroupDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color={isDark ? "#666" : "#999"}
              />
            </TouchableOpacity>

            {errors.groupId ? <ThemedText style={styles.errorText}>{errors.groupId}</ThemedText> : null}

            {showGroupDropdown && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: isDark ? "#1a1a1a" : "white", borderColor: isDark ? "#444" : "#ccc" },
                ]}
              >
                {groupOptions.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: isDark ? "#333" : "#eee" },
                    ]}
                    onPress={() => handleGroupSelection(g.id)}
                  >
                    <ThemedText>{g.name}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ASSIGNEE */}
            <ThemedText style={styles.label}>Assignee *</ThemedText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  borderColor: errors.assigneeId ? "#ff3b30" : isDark ? "#444" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  opacity: !groupId || assigneOptions.length === 0 ? 0.5 : 1,
                },
              ]}
              onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              disabled={!groupId || assigneOptions.length === 0}
            >
              <ThemedText
                style={{
                  color:
                    !groupId || assigneOptions.length === 0
                      ? isDark ? "#666" : "#999"
                      : textColor,
                }}
              >
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
                color={isDark ? "#666" : "#999"}
              />
            </TouchableOpacity>

            {errors.assigneeId ? <ThemedText style={styles.errorText}>{errors.assigneeId}</ThemedText> : null}

            {showAssigneeDropdown && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: isDark ? "#1a1a1a" : "white", borderColor: isDark ? "#444" : "#ccc" },
                ]}
              >
                {assigneOptions.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: isDark ? "#333" : "#eee" },
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
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  color: textColor,
                  borderColor: isDark ? "#444" : "#000",
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={dueDate}
              onChangeText={(text) => setDueDate(formatDate(text))}
              maxLength={10}
              keyboardType="numeric"
            />

            {/* PRIORITY */}
            <ThemedText style={styles.label}>Priority</ThemedText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  borderColor: isDark ? "#444" : "#000",
                },
              ]}
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <ThemedText style={{ color: priority ? textColor : isDark ? "#666" : "#999" }}>
                {priority ? priority : "Select Priority"}
              </ThemedText>

              <MaterialIcons
                name={showPriorityDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color={isDark ? "#666" : "#999"}
              />
            </TouchableOpacity>

            {showPriorityDropdown && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: isDark ? "#1a1a1a" : "white", borderColor: isDark ? "#444" : "#ccc" },
                ]}
              >
                {["Low", "Medium", "High"].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.dropdownItem,
                      { borderBottomColor: isDark ? "#333" : "#eee" },
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

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: tintColor }, submitting && styles.buttonDisabled]}
            onPress={handleAddTask}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="add-task" size={20} color="white" />
                <ThemedText style={styles.buttonText}>Add Task</ThemedText>
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
  container: { flex: 1 },
  safeArea: { flex: 1 },

  headerContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 20,
    alignSelf: "stretch",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },

  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    marginBottom: 20,
    marginTop: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },

  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    height: 100,
    fontSize: 16,
    marginBottom: 18,
  },

  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },

  dropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 18,
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
  },

  errorText: {
    color: "#ff3b30",
    fontSize: 13,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 4,
  },

  button: {
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  buttonDisabled: { opacity: 0.6 },
});