import { auth } from '@/database/firebase';

export const getCurrentUserId = async (): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return currentUser.uid;
    }
    
    // If no user is authenticated, throw an error instead of returning test ID
    throw new Error('No authenticated user found');
    
  } catch (error) {
    console.error('Error getting current user ID:', error);
    throw error;
  }
};
