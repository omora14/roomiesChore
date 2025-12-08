import { ThemedText } from '@/components/themed-text';
import { db } from '@/database/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskForm from './task-form';

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
  textColors?: {
    light: string;
    dark: string;
  };
};

// Helper function to get display name for a user
const getUserDisplayName = (user: User | string): string => {
  if (typeof user === 'string') return user;

  // Prefer firstName + lastName combination
  if (user.firstName || user.lastName) {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName) return fullName;
  }

  // Fallback to name, email, or unknown
  return user.name || user.email || 'Unknown User';
};

// Helper function to get display name for a group
const getGroupDisplayName = (group: Group | string): string => {
  if (typeof group === 'string') return group;

  // Prefer group_name, then name
  return group.group_name || group.name || 'Uncategorized';
};

export default function TaskList({ tasks, textColors }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskGroup, setTaskGroup] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [refresh, setRefresh] = useState(false);

  async function toggleCompletion(task: Task) {
    console.log('toggle function launched')
    try {
      const docRef = doc(db, 'tasks', task.id);
      console.log(docRef);
      const document = await getDoc(docRef);
      console.log(document);
      const data = document.data();
      console.log(data);

      // Make sure there is data before trying to change it
      if (!data) return;

      // Change is_done to whatever it isn't currently
      await updateDoc(docRef, { is_done: !data.is_done });

      task.is_done = !task.is_done;
      setRefresh(r => !r);
  
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  }

  function handleEditTask(taskData: Task): void {
    // TODO: Implement task editing
    console.log('Edit task:', taskData);
  }

  const renderTaskItem = ({ item }: { item: Task }) => {
    const done = !!item.is_done;

    // Get assignee names - display as "FirstName LastName"
    const assigneeNames = item.assignees && item.assignees.length > 0
      ? item.assignees.map(a => getUserDisplayName(a)).join(', ')
      : 'Unassigned';

    // Get group name - display as group_name
    const groupName = item.group ? getGroupDisplayName(item.group) : 'Uncategorized';

    // Get creator name
    const creatorName = getUserDisplayName(item.creator);

    // Format due date
    const dueDate = item.due_date
      ? new Date(item.due_date).toLocaleDateString()
      : null;

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedTask(item);
          setTaskDescription(item.description || "");
          setTaskAssignee(item.assignees?.[0] || "");
          setTaskGroup(typeof item.group === 'string' ? item.group : item.group.id || "");
          setTaskDueDate(item.due_date ? new Date(item.due_date).toISOString() : "");
          setTaskPriority(item.priority || "");
        }}
        style={styles.taskContainer}
      >
        <View style={styles.taskContent}>
          <ThemedText
            lightColor={textColors?.light}
            darkColor={textColors?.dark}
            style={styles.taskTitle}
          >
            {item.description}
          </ThemedText>

          <ThemedText
            lightColor={textColors?.light}
            darkColor={textColors?.dark}
            style={styles.taskMeta}
          >
            Assigned to: {assigneeNames}
          </ThemedText>

          <ThemedText
            lightColor={textColors?.light}
            darkColor={textColors?.dark}
            style={styles.taskMeta}
          >
            Group: {groupName}
          </ThemedText>

          {dueDate ? (
            <ThemedText
              lightColor={textColors?.light}
              darkColor={textColors?.dark}
              style={styles.taskMeta}
            >
              Due: {dueDate}
            </ThemedText>
          ) : null}

          <ThemedText
            lightColor="#666"
            darkColor="#999"
            style={styles.taskCreator}
          >
            Created by: {creatorName}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.completeButton, { borderColor: done ? 'green' : 'blue' }]}
          onPress={(e) => {
            e.stopPropagation();
            toggleCompletion(item);
          }}
          accessibilityLabel={done ? 'Task completed' : 'Mark task complete'}
        >
          {done ? (
            <ThemedText style={styles.checkmark}>✓</ThemedText>
          ) : null}
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
          <ThemedText
            lightColor={textColors?.light}
            darkColor={textColors?.dark}
            style={styles.emptyText}
          >
            No tasks found. Create your first task!
          </ThemedText>
        }
      />

      {selectedTask && (
        <Modal transparent visible={!!selectedTask} onRequestClose={() => setSelectedTask(null)}>
          <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={styles.modalContent}>
                  <TaskForm
                    initialTaskData={{
                      description: selectedTask.description,
                      creator: typeof selectedTask.creator === 'string'
                        ? selectedTask.creator
                        : selectedTask.creator.id,
                      assignees: Array.isArray(selectedTask.assignees) && selectedTask.assignees.length > 0
                        ? typeof selectedTask.assignees[0] === 'string'
                          ? selectedTask.assignees[0]
                          : selectedTask.assignees[0].id
                        : '',
                      group: typeof selectedTask.group !== "string"
                        ? selectedTask.group.id
                        : selectedTask.group,
                      due_date: selectedTask.due_date
                        ? (typeof selectedTask.due_date === 'string'
                          ? selectedTask.due_date
                          : new Date(selectedTask.due_date).toISOString())
                        : '',
                      is_done: selectedTask.is_done,
                      priority: selectedTask.priority
                    }}
                    onSubmit={() => {
                      handleEditTask(selectedTask);
                      setSelectedTask(null);
                    }}
                    pageHeading='Edit Task'
                    showDeleteButton
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
  listContainer: {
    padding: 16,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  taskContent: {
    flex: 1,
    paddingRight: 12,
  },
  taskTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
  },
  taskMeta: {
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 4,
  },
  taskCreator: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  completeButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkmark: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    height: '80%',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
