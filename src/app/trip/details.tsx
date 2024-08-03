import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { LinkServer } from "@/server/link-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

export function Details({ tripId }: { tripId: string }) {
    //MODAL
    const [showLinkModal, setShowLinkModal] = useState(false)

    //INPUTS
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')

    //LOADING
    const [isCreatingLink, setIsCreatingLink] = useState(false)


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
        } catch (error) {
            
        } finally {
            setIsCreatingLink(false)
        }
    }

    return (
        <View className="flex-1 mt-10">
            <Text className="text-zinc-50 text-2xl font-semibold mb-2">Links Importantes</Text>
            <View className="flex-1">
                <Button 
                variant="secondary"
                onPress={() => setShowLinkModal(true)}
                >
                    <Plus size={20} color={colors.zinc[400]} />
                    <Button.Title
                    >Cadastrar novo link
                    </Button.Title>
                </Button>
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