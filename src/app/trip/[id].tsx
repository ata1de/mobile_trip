import { TripDetails, tripServer } from "@/server/trip-server";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

type TripData = TripDetails & { when: string }

export default function Trip() {
    // Loading
    const [ isLoadingTrip, setIsLoadingTrip ] = useState(false)

    //Data
    const [ tripData, setTripData ] = useState({} as TripData)

    const tripId = useLocalSearchParams<{ id: string}>().id

    async function fetchTripData() {
        try {
            setIsLoadingTrip(false)

            if (!tripId) {
                return router.back()
            }

            const tripDetails = await tripServer.getTripDetails(tripId)
            console.log(tripDetails)
        } catch (error) {
            throw error
        } finally {
            setIsLoadingTrip(false)
        }
    }

    useEffect(() => {
        fetchTripData()
    }, [])

    
    return (
        <View className="flex-1 px-5 pt-16">
            <Text className="text-white text-2xl text-center">Trip</Text>
        </View>
    )
}