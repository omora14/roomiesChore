import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TaskList from '@/components/ui/task-list';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/database/firebase';
import { useThemeColor } from '@/hooks/use-theme-color';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    updatedAt?: any;
    priority?: any;
};


export default function TasksScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const backgroundColor = useThemeColor({}, "background");
    const textColor = useThemeColor({}, "text");
    const tintColor = useThemeColor({}, "tint");
    const isDark = theme === "dark";
    
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
                 setError(null);
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
        <ThemedView style={styles.container}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
                <View style={styles.content}>
                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={() => console.log('Create Group Pressed')}
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
                                    borderColor: isDark ? '#3a3a3a' : '#e0e0e0',
                                }
                            ]}
                        >
                            <MaterialIcons name="group-add" size={20} color={tintColor} />
                            <ThemedText style={[styles.buttonText, { color: tintColor }]}>
                                Create Group
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/addTask')}
                            style={[
                                styles.actionButton,
                                styles.primaryButton,
                                { backgroundColor: tintColor }
                            ]}
                        >
                            <MaterialIcons name="add-task" size={20} color="white" />
                            <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                                Create Task
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Content Area */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={tintColor} />
                            <ThemedText style={styles.loadingText}>Loading tasks...</ThemedText>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContainer}>
                            <MaterialIcons name="error-outline" size={48} color="#ff3b30" />
                            <ThemedText style={[styles.errorText, { color: '#ff3b30' }]}>
                                {error}
                            </ThemedText>
                             {/* Retry button to re-mount screen and trigger snapshot again */}
                            <TouchableOpacity
                                onPress={() => router.replace('/(tabs)/tasksScreen')}
                                style={[
                                    styles.actionButton,
                                    {
                                        marginTop: 20,
                                        backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
                                        borderColor: isDark ? '#3a3a3a' : '#e0e0e0',
                                    }
                                ]}
                            >
                                <ThemedText style={styles.buttonText}>
                                    Retry
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : tasks.length > 0 ? (
                        <TaskList tasks={tasks} />
                    ) : (
                        <View style={styles.centerContainer}>
                            <MaterialIcons name="assignment" size={64} color={isDark ? '#666' : '#ccc'} />
                            <ThemedText style={styles.emptyText}>
                                No tasks found
                            </ThemedText>
                            <ThemedText style={styles.emptySubtext}>
                                Create your first task to get started!
                            </ThemedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
    },
    primaryButton: {
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: 'white',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        opacity: 0.7,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        opacity: 0.8,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        opacity: 0.6,
        textAlign: 'center',
    },
});
