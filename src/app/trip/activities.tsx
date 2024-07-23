import { useState } from "react";
import { Alert, Keyboard, Text, View } from "react-native";

import { colors } from "@/styles/colors";
import dayjs from "dayjs";
import { Clock, Calendar as IconCalendar, Plus, Tag } from "lucide-react-native";

import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

import { ActivitiesServer } from "@/server/activity-server";
import { TripDetails } from "@/server/trip-server";


type ActivitiesProps = {
    tripData: TripDetails
}

enum MODAL{
    NONE = 0,
    CALENDAR = 1,
    ACTIVITY = 2,
}

export function Activities({ tripData }: ActivitiesProps) {
    //MODAL
    const [modal, setModal] = useState(MODAL.NONE)

    //LOADING
    const [isLoadingActivity, setIsLoadingActivity] = useState(false)

    //DATA
    const [ activityTitle, setActivityTitle ] = useState('')
    const [ activityDate, setActivityDate ] = useState('')
    const [ activityHour, setActivityHour ] = useState('')

    function resetFields() {
        setActivityTitle('')
        setActivityDate('')
        setActivityHour('')
        setModal(MODAL.NONE)
    }

    async function handleAddActivity() {
        try {
            
            if (!activityTitle || !activityDate || !activityHour) {
                return Alert.alert('Cadastrar as atividades','Preencha todos os campos')
            }

            setIsLoadingActivity(true)

            await ActivitiesServer.create({
                tripId: tripData.id,
                title: activityTitle,
                occurs_at: dayjs(activityDate).add(Number(activityHour), 'hour').toISOString()
            })

            Alert.alert('Atividade cadastrada', 'Atividade cadastrada com sucesso', [
                {
                    text: 'OK',
                    onPress: () => resetFields()
                }
            ])
        } catch (error) {
            
        } finally{
            setIsLoadingActivity(false)
        }
    }

    return (
        <View className="flex-1">
            <View className="w-full flex-row my-5 items-center">
                <Text className="text-zinc-50 text-2xl font-semibold flex-1">Atividades</Text>
                
                <Button onPress={() => setModal(MODAL.ACTIVITY)} className="flex-1">
                    <Plus size={20} color={colors.zinc[800]} />
                    <Button.Title>Adicionar Atividade</Button.Title>
                </Button>
            </View>

            <Modal 
            visible={modal === MODAL.ACTIVITY} 
            onClose={() => setModal(MODAL.NONE)}
            title="Cadastra Atividade"
            subtitle='Preencha os campos abaixo para cadastrar uma atividade'
            >
                <View className="my-3">
                    <Input variant="secondary">
                        <Tag size={20} color={colors.zinc[400]} />
                        <Input.Field 
                        value={activityTitle} 
                        onChangeText={setActivityTitle}
                        placeholder="Qual atividade você deseja fazer?"
                        ></Input.Field>
                    </Input>
                </View>

                <View className="w-full mt-2 flex-row gap-2">
                    <Input variant="secondary" className="flex-1">
                            <IconCalendar size={20} color={colors.zinc[400]} />
                            <Input.Field 
                            value={
                                activityDate ? 
                                dayjs(activityDate).format('DD [de] MMMM') :  ''
                            } 
                            onPressIn={() => setModal(MODAL.CALENDAR)}
                            placeholder="Data"
                            onFocus={() => Keyboard.dismiss()}
                            showSoftInputOnFocus={false}
                            >

                            </Input.Field>
                    </Input>

                    <Input variant="secondary" className="flex-1">
                        <Clock size={20} color={colors.zinc[400]} />
                        <Input.Field 
                        value={activityHour} 
                        onChangeText={(text) => setActivityHour(text.replace('.', '').replace(',', ' '))}
                        keyboardType="numeric"
                        placeholder="Horário"
                        ></Input.Field>
                    </Input>
                </View>

                <Button 
                    onPress={handleAddActivity} 
                    isLoading={isLoadingActivity} 
                    className="mt-3"
                    >
                        <Button.Title>Cadastrar</Button.Title>
                </Button>

            </Modal>

            <Modal 
            title='Selecionar datas'
            subtitle='Selecione a data da atividade'
            visible={modal === MODAL.CALENDAR}
            onClose={() => setModal(MODAL.ACTIVITY)}
            >

                <View className='gap-4 mt-4'>
                    <Calendar
                    onDayPress={(day) => setActivityDate(day.dateString)}
                    markedDates={{ [activityDate]: { selected: true} }}
                    initialDate={tripData.start_at.toString()}
                    maxDate={tripData.end_at.toString()}
                    minDate={tripData.start_at.toString()}

                    />

                    <Button onPress={() => setModal(MODAL.ACTIVITY)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>

                </View>
            </Modal>
        </View>
    )
}