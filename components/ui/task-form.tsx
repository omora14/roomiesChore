import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { getCurrentUserId } from "@/services/auth";
import { getGroupMembers, getUserGroupsScalable } from "@/services/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { DocumentReference } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TaskData {
  description: string;
  creator: string;
  assignees: string[];
  group: string | DocumentReference;
  due_date: string;
  is_done: boolean;
  priority: string;
}

interface TaskFormProps {
  initialTaskData?: Partial<TaskData>;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  pageHeading?: string;
  showDeleteButton?: boolean;
}

export default function TaskForm({
  initialTaskData,
  onSubmit,
  onDelete,
  pageHeading,
  showDeleteButton,
}: TaskFormProps) {
  const { theme } = useTheme();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const isDark = theme === "dark";

  const [title, setTitle] = useState(initialTaskData?.description || "");
  const [assigneeId, setAssignee] = useState(
    initialTaskData?.assignees?.[0] || ""
  );

  const formatInitialDate = (date: any) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch (e) {
      return "";
    }
  };

  const [dueDate, setDueDate] = useState(
    formatInitialDate(initialTaskData?.due_date)
  );
  const [priority, setPriority] = useState(initialTaskData?.priority || "");
  const [submitting, setSubmitting] = useState(false);

  const [groupOptions, setGroupOptions] = useState<
    { id: string; name: string; color?: string }[]
  >([]);
  const [assigneOptions, setAssigneOptions] = useState<
    { id: string; name: string }[]
  >([]);
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

  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        setLoading(true);
        const currentUserId = await getCurrentUserId();
        const userGroups = await getUserGroupsScalable(currentUserId);
        setGroupOptions(userGroups);
      } catch (error) {
        console.error("Error loading groups:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserGroups();
  }, []);

  useEffect(() => {
    if (!initialTaskData?.group) return;
    let gId =
      typeof initialTaskData.group === "string"
        ? initialTaskData.group
        : (initialTaskData.group as any).id;
    setGroupId(gId);
    if (gId) handleGroupSelection(gId);
  }, [initialTaskData]);

  const handleGroupSelection = async (selectedGroupId: string) => {
    setGroupId(selectedGroupId);
    setShowGroupDropdown(false);
    try {
      const members = await getGroupMembers(selectedGroupId);
      setAssigneOptions(members);
      if (initialTaskData?.assignees && initialTaskData.assignees.length > 0) {
        const initialAssignee = initialTaskData.assignees[0];
        const assignId =
          typeof initialAssignee === "string"
            ? initialAssignee
            : (initialAssignee as any).id;
        if (members.find((m) => m.id === assignId)) setAssignee(assignId);
        else if (members.length > 0 && !assigneeId) setAssignee(members[0].id);
      } else {
        setAssignee("");
      }
    } catch (error) {
      console.error("Error loading group members:", error);
    }
  };

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length > 4 && cleaned.length <= 6)
      return cleaned.slice(0, 4) + "-" + cleaned.slice(4);
    if (cleaned.length > 6)
      return (
        cleaned.slice(0, 4) +
        "-" +
        cleaned.slice(4, 6) +
        "-" +
        cleaned.slice(6, 8)
      );
    return cleaned;
  };

  const handleEditTask = async () => {
    let newErrors = { title: "", assigneeId: "", groupId: "" };
    let hasError = false;
    if (!title.trim()) {
      newErrors.title = "Title is required.";
      hasError = true;
    }
    if (!groupId.trim()) {
      newErrors.groupId = "Group is required.";
      hasError = true;
    }
    setErrors(newErrors);
    if (hasError) return;

    setSubmitting(true);
    const taskData = {
      description: title,
      assignees: assigneeId ? [assigneeId] : [],
      group: groupId,
      due_date: dueDate,
      priority: priority,
      is_done: initialTaskData?.is_done || false,
    };
    await onSubmit(taskData);
    setSubmitting(false);
  };

  const handleDeleteTask = () => {
    if (onDelete) {
      // Check if we are on the Web
      if (Platform.OS === "web") {
        const confirm = window.confirm(
          "Are you sure you want to delete this task? This cannot be undone."
        );
        if (confirm) {
          onDelete();
        }
      } else {
        // Use Native Alert for iOS/Android
        Alert.alert("Delete Task", "Are you sure? This cannot be undone.", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete() },
        ]);
      }
    } else {
      console.error("No onDelete function provided");
    }
  };

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
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? "#2a2a2a" : "#fafafa",
                borderColor: isDark ? "#3a3a3a" : "#e0e0e0",
              },
            ]}
          >
            <ThemedText style={styles.label}>Task Title *</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  color: textColor,
                  borderColor: errors.title
                    ? "#ff3b30"
                    : isDark
                    ? "#444"
                    : "#ccc",
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor="#999"
            />

            <ThemedText style={styles.label}>Group *</ThemedText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  borderColor: errors.groupId
                    ? "#ff3b30"
                    : isDark
                    ? "#444"
                    : "#ccc",
                },
              ]}
              onPress={() => setShowGroupDropdown(!showGroupDropdown)}
            >
              <ThemedText style={{ color: loading ? "#999" : textColor }}>
                {groupId
                  ? groupOptions.find((g) => g.id === groupId)?.name
                  : "Select Group"}
              </ThemedText>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
            {showGroupDropdown &&
              groupOptions.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={styles.dropdownItem}
                  onPress={() => handleGroupSelection(g.id)}
                >
                  <ThemedText>{g.name}</ThemedText>
                </TouchableOpacity>
              ))}

            <ThemedText style={styles.label}>Assignee</ThemedText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  borderColor: errors.assigneeId
                    ? "#ff3b30"
                    : isDark
                    ? "#444"
                    : "#ccc",
                },
              ]}
              onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            >
              <ThemedText style={{ color: textColor }}>
                {assigneeId
                  ? assigneOptions.find((a) => a.id === assigneeId)?.name
                  : "Select Assignee"}
              </ThemedText>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
            {showAssigneeDropdown &&
              assigneOptions.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setAssignee(a.id);
                    setShowAssigneeDropdown(false);
                  }}
                >
                  <ThemedText>{a.name}</ThemedText>
                </TouchableOpacity>
              ))}

            <ThemedText style={styles.label}>Due Date</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  color: textColor,
                  borderColor: isDark ? "#444" : "#ccc",
                },
              ]}
              value={dueDate}
              onChangeText={(t) => setDueDate(formatDate(t))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <ThemedText style={styles.label}>Priority</ThemedText>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdownButton,
                {
                  backgroundColor: isDark ? "#1a1a1a" : "white",
                  borderColor: isDark ? "#444" : "#ccc",
                },
              ]}
              onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
            >
              <ThemedText style={{ color: textColor }}>
                {priority || "Select Priority"}
              </ThemedText>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={textColor}
              />
            </TouchableOpacity>
            {showPriorityDropdown &&
              ["Low", "Medium", "High"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setPriority(p);
                    setShowPriorityDropdown(false);
                  }}
                >
                  <ThemedText>{p}</ThemedText>
                </TouchableOpacity>
              ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: tintColor },
              submitting && styles.buttonDisabled,
            ]}
            onPress={handleEditTask}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="white" />
                <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {showDeleteButton && (
            <TouchableOpacity
              style={[styles.deleteButton, submitting && styles.buttonDisabled]}
              onPress={handleDeleteTask}
              disabled={submitting}
            >
              <>
                <MaterialIcons name="delete" size={20} color="white" />
                <ThemedText style={styles.buttonText}>Delete Task</ThemedText>
              </>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  headerContainer: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },
  headerTitle: { fontSize: 24, fontWeight: "700" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  card: { borderRadius: 16, padding: 20, borderWidth: 1.5, marginBottom: 20 },
  label: { fontWeight: "600", fontSize: 15, marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderColor: "#eee" },
  errorText: { color: "#ff3b30", fontSize: 13, marginTop: 6, marginLeft: 4 },
  button: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
  deleteButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#ff3b30",
  },
});
