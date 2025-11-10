import TaskList from '@/components/ui/task-list';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GroupScreen() {

  const { groupId } = useLocalSearchParams();

  const currentDate: Date = new Date();
  
  const dateString: string = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  
  // Change to retrieve group tasks from database.
  const groupTasks: { id: number, title: string }[] = [
    {id: 1,
      title: 'Clean kitchen'
    },
    {id: 2,
      title: 'Vacuum living room'
    },
    {id: 3,
      title: 'Clean out fridge'
    },
    {id: 4,
      title: 'Do dishes'
    },
    {id: 5,
      title: 'Take out kitchen trash'
    },
  ];
  // Change to retrieve individual tasks from database
  const individualTasks: { id: number, title: string }[] = [
    {id: 3,
      title: 'Vacuum living room'
    },
    {id: 4,
      title: 'Do dishes'
    },
    {id: 5,
      title: 'Take out kitchen trash'
    },
  ];
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white', padding: 10,}}>

    <Text style={{ marginTop: 20 }}>{dateString}</Text>

    <Text style={{fontWeight: 'bold', fontSize: 25, marginTop: 30}}>
      {/* Replace with actual group name */}
    Group Name
    </Text>

    <View>
    <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
      Individual Tasks
    </Text>
    {/* Create scrollable list of tasks for entire group */}
      <TaskList tasks={individualTasks} />
      </View>
    <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
      Group Tasks
    </Text>
      <TaskList tasks={groupTasks}/>
  </SafeAreaView>
);
}