import { ThemedText } from "@/components/themed-text";
import { db } from "@/database/firebase";
import { deleteTask, updateTask } from "@/services/database"; // Import backend functions
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TaskForm from "./task-form";

// ... (keep User, Group, Task types and Helper functions like getUserDisplayName) ...
type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
};
type Group = {
  id: string;
  name?: string;
  group_name?: string;
  color?: string;
  [key: string]: any;
};
type Task = {
  id: string;
  description: string;
  creator: User | string;
  assignees: User[] | any[];
  group: Group | string;
  due_date: string | Date;
  is_done: boolean;
  createdAt?: any;
  priority?: any;
  updatedAt?: any;
};
type TaskListProps = {
  tasks: Task[];
  textColors?: { light: string; dark: string };
};

const getUserDisplayName = (user: User | string): string => {
  if (typeof user === "string") return user;
  if (user.firstName || user.lastName) {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (fullName) return fullName;
  }
  return user.name || user.email || "Unknown User";
};
const getGroupDisplayName = (group: Group | string): string => {
  if (typeof group === "string") return group;
  return group.group_name || group.name || "Uncategorized";
};

export default function TaskList({ tasks, textColors }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refresh, setRefresh] = useState(false);

  async function toggleCompletion(task: Task) {
    try {
      const docRef = doc(db, "tasks", task.id);
      const document = await getDoc(docRef);
      const data = document.data();
      if (!data) return;
      await updateDoc(docRef, { is_done: !data.is_done });
      task.is_done = !task.is_done;
      setRefresh((r) => !r);
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  }

  // --- SAVE HANDLER ---
  const handleSaveTask = async (taskData: any) => {
    if (!selectedTask) return;
    try {
      await updateTask(selectedTask.id, taskData);
      Alert.alert("Success", "Task updated!");
      setSelectedTask(null);
      setRefresh((r) => !r);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update task");
    }
  };

  // --- DELETE HANDLER (This was missing) ---
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await deleteTask(selectedTask.id);
      Alert.alert("Success", "Task deleted!");
      setSelectedTask(null);
      setRefresh((r) => !r);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to delete task");
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const done = !!item.is_done;
    const assigneeNames =
      item.assignees && item.assignees.length > 0
        ? item.assignees.map((a) => getUserDisplayName(a)).join(", ")
        : "Unassigned";
    const groupName = item.group
      ? getGroupDisplayName(item.group)
      : "Uncategorized";
    const creatorName = getUserDisplayName(item.creator);
    const dueDate = item.due_date
      ? new Date(item.due_date).toLocaleDateString()
      : null;

    return (
      <TouchableOpacity
        onPress={() => setSelectedTask(item)}
        style={styles.taskContainer}
      >
        <View style={styles.taskContent}>
          <ThemedText style={styles.taskTitle}>{item.description}</ThemedText>
          <ThemedText style={styles.taskMeta}>
            Assigned to: {assigneeNames}
          </ThemedText>
          <ThemedText style={styles.taskMeta}>Group: {groupName}</ThemedText>
          {dueDate ? (
            <ThemedText style={styles.taskMeta}>Due: {dueDate}</ThemedText>
          ) : null}
          <ThemedText style={styles.taskCreator}>
            Created by: {creatorName}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[
            styles.completeButton,
            { borderColor: done ? "green" : "blue" },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            toggleCompletion(item);
          }}
        >
          {done ? <ThemedText style={styles.checkmark}>✓</ThemedText> : null}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        extraData={refresh}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No tasks found.</ThemedText>
        }
      />

      {/* MODAL */}
      {selectedTask && (
        <Modal
          transparent
          visible={!!selectedTask}
          onRequestClose={() => setSelectedTask(null)}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalContent}>
                  <TaskForm
                    initialTaskData={{
                      description: selectedTask.description,
                      creator:
                        typeof selectedTask.creator === "string"
                          ? selectedTask.creator
                          : selectedTask.creator.id,
                      assignees:
                        Array.isArray(selectedTask.assignees) &&
                        selectedTask.assignees.length > 0
                          ? [
                              typeof selectedTask.assignees[0] === "string"
                                ? selectedTask.assignees[0]
                                : selectedTask.assignees[0].id,
                            ]
                          : [],
                      group:
                        typeof selectedTask.group !== "string"
                          ? selectedTask.group.id
                          : selectedTask.group,
                      due_date: selectedTask.due_date
                        ? typeof selectedTask.due_date === "string"
                          ? selectedTask.due_date
                          : new Date(selectedTask.due_date).toISOString()
                        : "",
                      is_done: selectedTask.is_done,
                      priority: selectedTask.priority,
                    }}
                    onSubmit={handleSaveTask}
                    onDelete={handleDeleteTask}
                    pageHeading="Edit Task"
                    showDeleteButton={true}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 16 },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  taskContent: { flex: 1, paddingRight: 12 },
  taskTitle: { fontWeight: "600", fontSize: 16, marginBottom: 6 },
  taskMeta: { opacity: 0.8, fontSize: 14, marginBottom: 4 },
  taskCreator: { fontSize: 12, marginTop: 8, fontStyle: "italic" },
  completeButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  checkmark: { color: "green", fontSize: 14, fontWeight: "bold" },
  separator: { height: 10 },
  emptyText: { textAlign: "center", marginTop: 20, opacity: 0.7 },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    height: "85%",
    borderRadius: 10,
    overflow: "hidden",
  },
});
