import { TripDetails } from "@/server/trip-server";
import { Text, View } from "react-native";

type ActivitiesProps = {
    tripData: TripDetails
}

export function Activities({ tripData }: ActivitiesProps) {
    return (
        <View className="flex-1">
            <Text className="text-white">Activities</Text>
        </View>
    )
}