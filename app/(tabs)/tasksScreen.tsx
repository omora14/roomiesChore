import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TaskList from '@/components/ui/task-list';
import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';


export default function TasksScreen() {
    const tasks = useMemo(() => (
        [
            {
                id: 1,
                title: 'Take out the trash',
                creator: 'Alice',
                assignee: 'Bob',
                description: 'Take out trash and recycling bins to the curb',
                group: 'Kitchen Chores',
                due_date: new Date().toISOString(),
                is_done: false,
            },
            {
                id: 2,
                title: 'Clean the bathroom',
                creator: 'Charlie',
                assignee: 'Dana',
                description: 'Wipe surfaces, mirror, and mop the floor',
                group: 'Bathroom',
                due_date: new Date(Date.now() + 86400000).toISOString(),
                is_done: true,
            },
            {
                id: 3,
                title: 'Vacuum living room',
                creator: 'Eve',
                assignee: 'Frank',
                description: 'Vacuum carpet and under the sofa',
                group: 'Common Area',
                due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
                is_done: false,
            },
        ]
    ), []);


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


                <View style={{ paddingVertical: 8, marginBottom: 8 }}>
                    <ThemedText style={{ opacity: 0.7 }}>Filter/Sort UI Placeholder</ThemedText>
                </View>
            </View>


            <TaskList tasks={tasks} />
        </ThemedView>
    );
}
