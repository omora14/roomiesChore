import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Logo from '../assets/images/logo.svg';
export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
        router.replace('/login');
    }, 2000);
  
  return () => clearTimeout(timer);
}, []);
  
return  (
  <View style={styles.screen}>
    <Logo width={500} />
  </View>
 ) 
}

const styles = StyleSheet.create({
    screen: {
      backgroundColor: 'white',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }
  )