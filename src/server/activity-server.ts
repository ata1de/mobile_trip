import { api } from "./api"

type Activity = {
  id: string
  occurs_at: string
  title: string
}

type ActivityCreate = Omit<Activity, "id"> & {
  tripId: string
}

type ActivityResponse = {
  activities: {
    date: string
    activities: Activity[]
  }[]
}

async function create({ tripId, occurs_at, title }: ActivityCreate) {
  try {
    const { data } = await api.post<{ activityId: string }>(
      `/trip/${tripId}/activities`,
      { occurs_at, title }
    )

    return data
  } catch (error) {
    throw error
  }
}

async function getActivitiesByTripId(tripId: string) {
  try {
    const { data } = await api.get<ActivityResponse>(
      `/trip/${tripId}/activities`
    )
    return data.activities
  } catch (error) {
    throw error
  }
}

export const ActivitiesServer = { create, getActivitiesByTripId }