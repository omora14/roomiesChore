import { ThemedText } from '@/components/themed-text';
import { db } from '@/database/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { FlatList, Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = {
  id: string;
  // title: string;
  description?: string;
  creator?: any;
  assignees?: any[];
  group?: any;
  due_date?: any;
  is_done?: boolean;
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


export default function TaskList({ tasks, textColors }:TaskListProps) {
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [taskGroup, setTaskGroup] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("");

  
  async function toggleCompletion(task: Task) {
    const docRef = doc(db, 'tasks', task.id);
    const document = await getDoc(docRef);
    const data = document.data();

    // Make sure there is data before trying to change it.
    if (!data) return;

    // Change is_done to whatever it isn't currently
    await updateDoc(docRef, { is_done: !data.is_done })

    }


  return (
<SafeAreaView>

    <FlatList
      data={tasks}
      renderItem={({ item }) => {
        const done = !!item.is_done;
        return (
          <TouchableOpacity 
            onPress={() => {
              setSelectedTask(item);
              setTaskDescription(item.description || "");
              setTaskAssignee(item.assignees?.[0] || "");
              setTaskGroup(item.group || "");
              setTaskDueDate(item.due_date || "");
              setTaskPriority(item.priority || "");

            }
            }
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'lightgrey', borderRadius: 10, padding: 15 }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ fontWeight: '600', marginBottom: 4 }}>{item.description}</ThemedText>
              {item.assignees ? (
                <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ opacity: 0.8 }}>Assignees: {item.assignees.map(a => a.id || String(a)).join(', ')}</ThemedText>
              ) : null}
              {item.group ? (
                <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ opacity: 0.8 }}>Group: {item.group.id}</ThemedText>
              ) : null}
              {item.due_date ? (
                <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark} style={{ opacity: 0.8 }}>Due: {new Date(item.due_date).toLocaleDateString()}</ThemedText>
              ) : null}
            </View>
            <TouchableOpacity
              style={{ height: 24, width: 24, borderRadius: 100, borderWidth: 2, borderColor: done ? 'green' : 'blue', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => { toggleCompletion(item) }}
              accessibilityLabel={done ? 'Task completed' : 'Mark task complete'}
            >
              {done ? (
                <ThemedText style={{ color: 'green', fontSize: 14 }}>✓</ThemedText>
              ) : null}
            </TouchableOpacity>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />} // space between items
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={
        <ThemedText lightColor={textColors?.light} darkColor={textColors?.dark}>No tasks yet!</ThemedText>


      }
    />

    {selectedTask && (
      <Modal transparent style={{alignItems: 'center', justifyContent: 'center'}}>
      <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
        <View style={{backgroundColor: 'rgba(0, 0, 0, 0.75)', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <TouchableWithoutFeedback onPress={() => {}}>
          <View style={{backgroundColor: 'white', width: 200, height: 300}}>
            <ThemedText>{selectedTask.id}</ThemedText>
              {/* <View style={styles.modalContent}>
              <Image
                      source={{ uri: selectedOutfit.image }}
                      style={styles.modalImage}
                  />
              <TextInput
              placeholder='Outfit Description'
              value={description}
              onChangeText={setDescription}
              />
              <TextInput
              placeholder='Outfit Category'
              value={category}
              onChangeText={setCategory}
              />
              <TouchableOpacity style={styles.modalButton} onPress={() => editOutfit(selectedOutfit.id)}>
                  <Text style={styles.modalButtonText}>EDIT OUTFIT</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => deleteOutfit(selectedOutfit.id)}>
                  <Text style={styles.modalButtonText}>DELETE OUTFIT</Text>
              </TouchableOpacity>
              </View> */}
          </View>
          </TouchableWithoutFeedback>
          </View>
          </TouchableWithoutFeedback>
      </Modal>
  )}

</SafeAreaView>

    )
  
};
