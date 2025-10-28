import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function TaskList({ tasks }: { tasks: { id: number, title: string }[]} ) {
    return (

    <FlatList
      data={tasks}
      renderItem={({ item }) => (
        <View style={{flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'lightgrey', borderRadius: 10, padding: 15 }}>
            <Text>{item.title}</Text>
            <TouchableOpacity style={{ height: 20, width: 20, borderRadius: 100, borderWidth: 2, borderColor: 'blue'}}>
                
            </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />} // space between items
      keyExtractor={ (item, index) => index.toString()}
      ListEmptyComponent={
        <ThemedText>No groups yet!</ThemedText>
      }
      />
)};