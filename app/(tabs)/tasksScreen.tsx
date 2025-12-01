import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TaskList from '@/components/ui/task-list';
import { db } from '@/database/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';


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
    updatedAt?: any;
};


export default function TasksScreen() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Create a reference to the tasks collection
        const tasksRef = collection(db, 'tasks');
        // Create a query that orders tasks by due date
        const q = query(tasksRef, orderBy('due_date', 'asc'));

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const tasksData: Task[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    tasksData.push({
                        id: doc.id,
                        // title: data.title || 'Untitled Task',
                        creator: data.creator || 'Unknown',
                        assignees: data.assignees || 'Unassigned',
                        description: data.description || '',
                        group: data.group || 'Uncategorized',
                        due_date: data.due_date?.toDate()?.toISOString() || new Date().toISOString(),
                        is_done: data.is_done || false,
                    });
                });
                setTasks(tasksData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching tasks:', error);
                setError('Failed to load tasks. Please try again.');
                setLoading(false);
            }
        );

        // Clean up the listener on unmount
        return () => unsubscribe();
    }, []);


    return (
        <ThemedView style={{ flex: 1 }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                    <TouchableOpacity
                        onPress={() => console.log('Create Group Pressed')}
                        style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ThemedText>Create Group</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => console.log('Create Task Pressed')}
                        style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ThemedText>Create Task</ThemedText>
                    </TouchableOpacity>
                </View>

            </View>


            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <ThemedText style={{ marginTop: 10 }}>Loading tasks...</ThemedText>
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText style={{ color: 'red' }}>{error}</ThemedText>
                </View>
            ) : tasks.length > 0 ? (
                <TaskList tasks={tasks} />
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ThemedText>No tasks found. Create your first task!</ThemedText>
                </View>
            )}
        </ThemedView>
    );
}
