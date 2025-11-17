import React, { useState } from "react";
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

export default function AddTaskScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssignee] = useState("");
  const [groupId, setGroup] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");

  // Automatically format YYYY-MM-DD
  const formatDate = (text: string) => {
    // Remove everything except digits
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

  const handleAddTask = () => {
    if (!title.trim() || !assigneeId.trim() || !groupId.trim()) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    console.log("New Task:", {
      title,
      description,
      assigneeId,
      groupId,
      dueDate,
      priority,
    });

    Alert.alert("Task Created", "Your new task has been added successfully!");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Create Task</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Task Details</Text>

        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Take out the trash"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add more details about the task..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Assignee */}
          <Text style={styles.label}>Assignee *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. user123"
            value={assigneeId}
            onChangeText={setAssignee}
          />

          {/* Group */}
          <Text style={styles.label}>Group *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. groupA12"
            value={groupId}
            onChangeText={setGroup}
          />

          {/* Due Date */}
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={(text) => setDueDate(formatDate(text))}
            maxLength={10}
            keyboardType="numeric"
          />

          {/* Priority */}
          <Text style={styles.label}>Priority</Text>
          <TextInput
            style={styles.input}
            placeholder="Low / Medium / High"
            value={priority}
            onChangeText={setPriority}
          />
        </View>

        {/* Add Task Button */}
        <TouchableOpacity style={styles.button} onPress={handleAddTask}>
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  button: {
    backgroundColor: "#5E60CE",
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