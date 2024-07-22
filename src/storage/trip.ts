import AsyncStorage from "@react-native-async-storage/async-storage";

const TRIP_STORAGE_ID = '@planner:tripId'

async function save(tripId: string) {
   try {
    await AsyncStorage.setItem(TRIP_STORAGE_ID, tripId)
   } catch (error) {
    throw new Error(`Failed to save trip ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
   }
}

async function get() {
    try {
     const tripId = await AsyncStorage.getItem(TRIP_STORAGE_ID)
     return tripId
    } catch (error) {
     throw new Error(`Failed to get trip ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
 }

async function remove() {
    try {
     await AsyncStorage.removeItem(TRIP_STORAGE_ID)
    } catch (error) {
     throw new Error(`Failed to remove trip ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
 }

export const tripStorage = { save, get, remove }