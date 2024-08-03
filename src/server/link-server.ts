import { api } from "./api"


export type Link = {
    id: string
    url: string
    title: string
}

type LinkCreate = Omit<Link, 'id'> & {
    tripId: string

}

async function getLinksByTripId(tripId: string) {
    try {
        const { data } = await api.get<{ links: Link[] }>(`/trip/${tripId}/links`)

        return data.links

    } catch (error) {
        throw error
    }
}

async function createLink({title, url, tripId}: LinkCreate) {
    try {
        const { data } = await api.post<{ linkId: string }>(`/trip/${tripId}/links`, {
            title,
            url
        })

        return data
    } catch (error) {
        
    }
}

export const LinkServer = { getLinksByTripId, createLink }