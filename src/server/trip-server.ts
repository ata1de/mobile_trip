import { api } from './api'

export type TripDetails = {
    id: string
    destination: string
    start_at: string
    end_at: string
    is_confirmed: boolean
}

type TripCreate = Omit<TripDetails, 'id' | 'is_confirmed'> & {
    emails_to_invite: string[]
} 

async function getTripDetails(id: string) {
    try {
        const { data } = await api.get<{trip: TripDetails}>(`/trips/${id}`)
        return data.trip
        
    } catch (error) {
        throw error
    }
}

async function createTrip(trip: TripCreate) {
    try {
        const { data } = await api.post<{tripId: string}>('/trips', {
            ...trip,
            owner_name: 'John Doe',
            owner_email: 'johndoe@email.com'
        })
        return data
    } catch (error) {
        throw error
    }
}

export const tripServer = {
    getTripDetails,
    createTrip
}