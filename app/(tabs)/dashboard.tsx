import { ThemedText } from '@/components/themed-text';
import GroupCard from '@/components/ui/group-card';
import TaskList from '@/components/ui/task-list';
import { router } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {

  const navigateToGroupDetail = (groupPage: string) => {
    router.push(`../group/${groupPage}`);
  };

  // Change to retrieve data for user's groups.
  const data: { name: string, color: string }[] = [
    {name: 'Apartment 67',
      color: 'blue',
    },
    {name: 'Home',
      color: 'purple',
    },
    {name: 'Rental Property in NY',
      color: 'red',
    },
  ];
  const currentDate: Date = new Date();
  
  const dateString: string = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Change to retrieve user's first name
  const userFirstName: string = 'Phillip'
  
  // Change to retrieve upcoming tasks from database.
  const tasks: { id: number, title: string }[] = [
    {id: 1,
      title: 'Sweep bathroom floor'
    },
    {id: 2,
      title: 'Wash sheets'
    },
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

    <Text style={{fontWeight: 'bold', fontSize: 25, marginTop: 30}}>Welcome {userFirstName}!</Text>

    <View>
    <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
      My Groups
    </Text>
    {/* Create scrollable display of images stored in AsyncStorage. */}
    <FlatList
      horizontal
      data={data}
      renderItem={({ item }) => (
        <GroupCard name={item.name} color={item.color} onPress ={navigateToGroupDetail}/>
      )}
      contentContainerStyle={{ padding: 16 }}
      ItemSeparatorComponent={() => <View style={{ width: 16 }} />} // space between items
      keyExtractor={ (item, index) => index.toString()}
      ListEmptyComponent={
        <ThemedText>No groups yet!</ThemedText>
      }
      />
      </View>
    <Text style={{fontWeight: '600', fontSize: 20, marginTop: 30}}>
      Upcoming Tasks
    </Text>
      <TaskList tasks={tasks}/>
  </SafeAreaView>
);
}
