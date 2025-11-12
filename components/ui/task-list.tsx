import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

type Task = {
  id: number;
  title: string;
  description?: string;
  creator?: any;
  assignees?: any[];
  group?: any;
  due_date?: any;
  is_done?: boolean;
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
export default function TaskList({ tasks, textColors }: TaskListProps) {
  return (


    <FlatList
      data={tasks}
      renderItem={({ item }) => {
        const done = !!item.is_done;
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'lightgrey', borderRadius: 10, padding: 15 }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ fontWeight: '600', marginBottom: 4 }}>{item.title}</ThemedText>
              {item.assignees ? (
                <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ opacity: 0.8 }}>Assignee: {item.assignees}</ThemedText>
              ) : null}
              {item.group ? (
                <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ opacity: 0.8 }}>Group: {item.group}</ThemedText>
              ) : null}
              {item.due_date ? (
                <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ opacity: 0.8 }}>Due: {new Date(item.due_date).toLocaleDateString()}</ThemedText>
              ) : null}
            </View>
            <TouchableOpacity
              style={{ height: 24, width: 24, borderRadius: 100, borderWidth: 2, borderColor: done ? 'green' : 'blue', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => { }}
              accessibilityLabel={done ? 'Task completed' : 'Mark task complete'}
            >
              {done ? (
                <ThemedText style={{ color: 'green', fontSize: 14 }}>✓</ThemedText>
              ) : null}
            </TouchableOpacity>
          </View>
        );
      }}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />} // space between items
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark}>No tasks yet!</ThemedText>


      }
    />
  )
};
