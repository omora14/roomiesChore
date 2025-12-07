import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TaskList from '@/components/ui/task-list';
import { db } from '@/database/firebase';
import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

type Task = {
    id: string;
    title: string;
    creator: any;
    assignees: any[];
    description: string;
    group: any;
    due_date: string;
    is_done: boolean;
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

        // Function to fetch user data
        const fetchUserData = async (userRef: any) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', userRef.id || userRef));
                return userDoc.exists() ? userDoc.data() : null;
            } catch (error) {
                console.error('Error fetching user data:', error);
                return null;
            }
        };

        // Function to fetch group data
        const fetchGroupData = async (groupRef: any) => {
            try {
                const groupDoc = await getDoc(doc(db, 'groups', groupRef.id || groupRef));
                if (groupDoc.exists()) {
                    const data = groupDoc.data();
                    return {
                        id: groupDoc.id,
                        name: data.group_name || 'Uncategorized',
                        ...data
                    };
                }
                return { id: groupRef, name: 'Uncategorized' };
            } catch (error) {
                console.error('Error fetching group data:', error);
                return { id: groupRef, name: 'Uncategorized' };
            }
        };

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            q,
            async (querySnapshot) => {
                const tasksData: Task[] = [];

                // Process each task
                for (const doc of querySnapshot.docs) {
                    const data = doc.data();

                    // Fetch assignee data if it exists
                    let assignees = [];
                    if (data.assignees && data.assignees.length > 0) {
                        const assigneePromises = data.assignees.map((assigneeRef: any) =>
                            fetchUserData(assigneeRef)
                        );
                        const assigneeResults = await Promise.all(assigneePromises);
                        assignees = assigneeResults
                            .filter(user => user !== null)
                            .map(user => ({
                                id: user.uid,
                                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User',
                                ...user
                            }));
                    }

                    // Fetch creator data if it exists
                    let creator = { id: 'unknown', name: 'Unknown' };
                    if (data.creator) {
                        const creatorData = await fetchUserData(data.creator);
                        if (creatorData) {
                            creator = {
                                id: creatorData.uid,
                                name: `${creatorData.firstName || ''} ${creatorData.lastName || ''}`.trim() || creatorData.email || 'Unknown',
                                ...creatorData
                            };
                        }
                    }

                    // Fetch group data if it exists
                    let group = { id: 'uncategorized', name: 'Uncategorized' };
                    if (data.group) {
                        group = await fetchGroupData(data.group);
                    }

                    tasksData.push({
                        id: doc.id,
                        title: data.title || 'Untitled Task',
                        creator: creator,
                        assignees: assignees,
                        description: data.description || '',
                        group: group,
                        due_date: data.due_date?.toDate()?.toISOString() || new Date().toISOString(),
                        is_done: data.is_done || false,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    });
                }

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
