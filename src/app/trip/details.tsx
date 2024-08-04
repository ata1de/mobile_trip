import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { Participant, ParticipantProps } from "@/components/participant";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { LinkServer } from "@/server/link-server";
import { ParticipantsServer } from "@/server/participant-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";

export function Details({ tripId }: { tripId: string }) {
    //MODAL
    const [showLinkModal, setShowLinkModal] = useState(false)

    //INPUTS
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')

    //LOADING
    const [isCreatingLink, setIsCreatingLink] = useState(false)
    const [isLoadingLinks, setIsLoadingLinks] = useState(false)
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)

    //DATA
    const [dataLinks, setDataLinks] = useState<TripLinkProps[]>([])
    const [dataParticipants, setDataParticipants] = useState<ParticipantProps[]>([])


    function resetNewLinkFields() {
        setUrl('')
        setTitle('')
        setShowLinkModal(false)
    }

    async function handleAddLink() {
        try {
            if (!title.trim()) {
                return Alert.alert('Erro', 'Preencha todos os campos')
            }

            if (!validateInput.url(url.trim())) {
                return Alert.alert('Erro', 'Url inválida')
            }

            setIsCreatingLink(true)

            await LinkServer.createLink({title, url, tripId})

            Alert.alert('Sucesso', 'Link cadastrado com sucesso')

            resetNewLinkFields()
            
            await fetchLinks()
        } catch (error) {
            
        } finally {
            setIsCreatingLink(false)
        }
    }

    async function fetchLinks() {
        try {
            setIsLoadingLinks(true)
            const links = await LinkServer.getLinksByTripId(tripId)

            setDataLinks(links)
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os links')
        } finally {
            setIsLoadingLinks(false)
        }
    }

    async function getTripParticipants() {
        try {
            setIsLoadingParticipants(true)
            const participants = await ParticipantsServer.getByTripId(tripId)
            console.log(participants)

            setDataParticipants(participants)
        } catch (error) {
            console.log('error in getTripParticipants', error)
        } finally {
            setIsLoadingParticipants(false)
        }
    }

    useEffect(() => {
        fetchLinks()
        getTripParticipants()
    },[])

    return (
        <View className="flex-1 mt-10">
            <Text className="text-zinc-50 text-2xl font-semibold mb-2">Links Importantes</Text>  
            <View className="flex-1 border-b border-zinc-800">

                {
                    dataLinks.length == 0 ? (
                        <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
                            Nenhum link encontrado.
                        </Text>
                    ) : (
                        <FlatList 
                        data={dataLinks}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TripLink data={item} />}
                        contentContainerClassName="gap-3 py-3"
                        />
                    )
                }

                <Button 
                variant="secondary"
                onPress={() => setShowLinkModal(true)}
                className=""
                >
                    <Plus size={20} color={colors.zinc[400]} />
                    <Button.Title
                    >Cadastrar novo link
                    </Button.Title>
                </Button>
            </View>
            
            <Text className="text-zinc-50 text-2xl font-semibold my-6 ">Participantes da viagem</Text>
            <View className="flex-1 ">

                {
                    dataParticipants.length == 0 ? (
                        <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
                            Nenhum participante encontrado.
                        </Text>
                    ) : (
                        <FlatList 
                        data={dataParticipants}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <Participant data={item} />}
                        contentContainerClassName="gap-3 pb-3"
                        />
                    )
                }
            </View>

            <Modal
            title="Cadastrar novo link"
            subtitle="Preencha os campos abaixo para cadastrar um novo link"
            visible={showLinkModal}
            onClose={() => setShowLinkModal(false)}
            >
                <View className="gap-3 mb-3">
                    <Input variant="secondary">
                        <Input.Field
                        placeholder="Titulo do link"
                        onChangeText={setTitle}
                        ></Input.Field>
                    </Input>

                    <Input variant="secondary">
                        <Input.Field
                        placeholder="Escreva a url"
                        onChangeText={setUrl}
                        >

                        </Input.Field>
                    </Input>
                </View>

                <Button onPress={handleAddLink}
                isLoading={isCreatingLink}
                >
                    <Button.Title>Cadastrar link</Button.Title>
                </Button>

            </Modal>
        </View>
    )
}