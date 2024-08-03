import { useEffect, useState } from "react";
import { Alert, Keyboard, SectionList, Text, View } from "react-native";

import { colors } from "@/styles/colors";
import dayjs from "dayjs";
import { Clock, Calendar as IconCalendar, Plus, Tag } from "lucide-react-native";

import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";

import { Activity, ActivityProps } from "@/components/activity";
import { Loading } from "@/components/loading";
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

type TripActivities = {
    title: {
        dayNumber: number
        dayName: string
    },
    data: ActivityProps[]
}

export function Activities({ tripData }: ActivitiesProps) {
    //MODAL
    const [modal, setModal] = useState(MODAL.NONE)

    //LOADING
    const [isLoadingActivity, setIsLoadingActivity] = useState(true)

    //DATA
    const [ activityTitle, setActivityTitle ] = useState('')
    const [ activityDate, setActivityDate ] = useState('')
    const [ activityHour, setActivityHour ] = useState('')


    //LIST
    const [activitiesData, setActivitiesData] = useState<TripActivities[]>([])

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

            await fetchActivities()
        } catch (error) {
            
        } finally{
            setIsLoadingActivity(false)
        }
    }

    async function fetchActivities() {
        try {
            const activities = await ActivitiesServer.getActivitiesByTripId(tripData.id)
            
            const activitiesSectionList = activities.map(( dayActivity) => ({
                title: {
                    dayNumber: dayjs(dayActivity.date).date(),
                    dayName: dayjs(dayActivity.date).format('dddd').replace("-feira", "")
                },
                data: dayActivity.activities.map((activity) => ({
                    id: activity.id,
                    title: activity.title,
                    hour: dayjs(activity.occurs_at).format('hh[:]mm[h]'),
                    isBefore: dayjs(activity.occurs_at).isBefore(dayjs())
                }))
            }))

            setActivitiesData(activitiesSectionList)
        } catch (error) {
            console.log(error)
            throw error
        } finally {
            setIsLoadingActivity(false)
        }
    }

    useEffect(() => {
        fetchActivities()
    })

    return (
        <View className="flex-1">
            <View className="w-full flex-row my-5 items-center">
                <Text className="text-zinc-50 text-2xl font-semibold flex-1">Atividades</Text>
                
                <Button onPress={() => setModal(MODAL.ACTIVITY)} className="flex-1">
                    <Plus size={20} color={colors.zinc[800]} />
                    <Button.Title>Adicionar Atividade</Button.Title>
                </Button>
            </View>

            { isLoadingActivity ? <Loading /> :  
            
            <SectionList
            sections={activitiesData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Activity data={item} />}
            renderSectionHeader={({ section}) => (
                <View className="w-full">
                    <Text className="text-zinc-50 text-2xl font-semibold py-2">
                        Dia {section.title.dayName} 
                        <Text className="text-zinc-500 text-base font-regular capitalize"> - {section.title.dayName}</Text>
                    </Text>

                    {
                        section.data.length === 0 && (
                            <Text className="text-zinc-500 text-sm font-regular mb-8">Nenhuma atividade cadastrada</Text>
                        )
                    }
                </View>
            )}
            contentContainerClassName="gap-3 pb-48"
            showsVerticalScrollIndicator={false}
            />
            }

           
                

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