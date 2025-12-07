import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

type User = {
  id: string;
  name: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

type Group = {
  id: string;
  name: string;
  color?: string;
};

type Task = {
  id: string;
  description: string;
  creator: User | string;
  assignees: User[];
  group: Group | string;
  due_date: string;
  is_done: boolean;
  createdAt?: any;
  updatedAt?: any;
};

type TaskListProps = {
  tasks: Task[];
  textColors?: {
    light: string;
    dark: string;
  };
};

const getDisplayName = (item: User | string): string => {
  if (typeof item === 'string') return item;
  return item.name || item.email || 'Unknown';
};

export default function TaskList({ tasks, textColors }: TaskListProps) {
  const renderTaskItem = ({ item }: { item: Task }) => {
    const done = !!item.is_done;
    const assigneeNames = item.assignees?.length > 0
      ? item.assignees.map(a => getDisplayName(a)).join(', ')
      : 'Unassigned';

    const groupName = item.group ? getDisplayName(item.group as any) : 'Uncategorized';
    const creatorName = getDisplayName(item.creator);

    return (
      <View style={styles.taskContainer}>
        <View style={styles.taskContent}>
          <ThemedText
            lightColor={textColors?.light}
            darkColor={textColors?.dark}
            style={styles.taskTitle}
          >
            {item.description}
          </ThemedText>

          {item.description ? (
            <ThemedText
              lightColor={textColors?.light}
              darkColor={textColors?.dark}
              style={styles.taskDescription}
            >
              {item.description}
            </ThemedText>
          ) : null}

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

          {item.due_date ? (
            <ThemedText
              lightColor={textColors?.light}
              darkColor={textColors?.dark}
              style={styles.taskMeta}
            >
              Due: {new Date(item.due_date).toLocaleDateString()}
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
          onPress={() => { }}
          accessibilityLabel={done ? 'Task completed' : 'Mark task complete'}
        >
          {done ? (
            <ThemedText style={styles.checkmark}>✓</ThemedText>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={tasks}
      renderItem={renderTaskItem}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      keyExtractor={(item) => item.id}
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
  taskDescription: {
    opacity: 0.9,
    marginBottom: 8,
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
});
