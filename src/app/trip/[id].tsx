import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Modal } from "@/components/modal";
import { ParticipantsServer } from "@/server/participant-server";
import { TripDetails, tripServer } from "@/server/trip-server";
import { tripStorage } from "@/storage/trip";
import { colors } from "@/styles/colors";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { validateInput } from "@/utils/validateInput";
import dayjs from "dayjs";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarRange, Calendar as CalendarUpdateTrip, Info, Mail, MapPin, Settings2, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { DateData } from "react-native-calendars";
import { Activities } from "./activities";
import { Details } from "./details";

type TripData = TripDetails & { when: string }

enum MODAL {
    NONE = 0,
    UPDATE_TRIP = 1,
    CALENDAR = 2,
    CONFIRM_ATTENDANCE = 3
}

export default function Trip() {
    //Params
    const tripParams = useLocalSearchParams<{ id: string, participantId?: string}>()

    // Loading
    const [ isLoadingTrip, setIsLoadingTrip ] = useState(true)
    const [ isUpdating, setIsUpdating ] = useState(false)
    const [ isConfirmingAttendance, setIsConfirmingAttendance ] = useState(false)

    //Data
    const [ tripData, setTripData ] = useState({} as TripData)
    const [ options, setOptions ] = useState<'activity' | 'details'>('activity')
    const [ showModal, setShowModal ] = useState(MODAL.NONE)
    const [ guestName, setGuestName ] = useState('')
    const [ guestEmail, setGuestEmail ] = useState('')

    //Modal
    const [ isModalVisible, setIsModalVisible ] = useState(MODAL.NONE)
    const [ destination, setDestination ] = useState('')
    const [datesSelected, setDatesSelected] = useState({} as DatesSelected)



    async function fetchTripData() {
        try {

            if( tripParams.participantId) {
                setShowModal(MODAL.CONFIRM_ATTENDANCE)
            }

            if (!tripParams.id) {
                return router.back()
            }

            const tripDetails = await tripServer.getTripDetails(tripParams.id)
            
            const maxLenghtDestination = 14
            const destination = tripDetails.destination.length > maxLenghtDestination
                ? `${tripDetails.destination.slice(0, maxLenghtDestination)}...`
                : tripDetails.destination

            const starts_at = dayjs(tripDetails.start_at).format("DD")
            const ends_at = dayjs(tripDetails.end_at).format("DD")
            const month = dayjs(tripDetails.end_at).format("MMM")

            setDestination(tripDetails.destination)

            setTripData({
                ...tripDetails,
                when: `${destination} de ${starts_at} à ${ends_at} de ${month}`
            })
        } catch (error) {
            throw error
        } finally {
            setIsLoadingTrip(false)
        }
    }

    function handleSelectDates(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: datesSelected.startsAt,
            endsAt: datesSelected.endsAt,
            selectedDay
        })

        setDatesSelected(dates)
    }

    async function handleUpdateTrip() {
        try {
            
            if (!tripParams.id) {
                return router.back()
            }

            if (!destination || !datesSelected.startsAt || !datesSelected.endsAt) {
                return Alert.alert('Atualizar viagem', 'Preencha todos os campos')
            }

            setIsUpdating(true)

            await tripServer.update({
                id: tripParams.id,
                destination,
                start_at: dayjs(datesSelected.startsAt?.dateString).format('YYYY-MM-DD HH:mm:ss'),
                end_at: dayjs(datesSelected.endsAt?.dateString).format('YYYY-MM-DD HH:mm:ss')
            })

            Alert.alert('Atualizar viagem', 'Viagem atualizada com sucesso', [
                {
                    text: 'Ok',
                    onPress: () => {
                        setIsModalVisible(MODAL.NONE)
                        fetchTripData()
                    },
                }
            ])
        } catch (error) {
            console.log('error in update trip', error)
        
        } finally {
            setIsUpdating(false)
        }
    }

    async function handleConfirmAttendance() {
        try {
            if (!tripParams.participantId || !tripParams.id) {
                return router.back()
            }

            if (!guestName.trim() || !guestEmail.trim()) {
                return Alert.alert('Erro', 'Preencha todos os campos')
            }

            if(!validateInput.email(guestEmail.trim())) {
                return Alert.alert('Erro', 'E-mail inválido')
            }

            setIsConfirmingAttendance(true)

            await ParticipantsServer.confirmTripByParticipantId({
                participantId: tripParams.participantId,
                name: guestName,
                email: guestEmail})

            Alert.alert('Sucesso', 'Presença confirmada com sucesso', [
                {
                    text: 'Ok',
                    onPress: () => {
                        setShowModal(MODAL.NONE)
                        fetchTripData()
                    }
                }
            ])

            await tripStorage.save(tripParams.id)
        } catch (error) {
            console.log('error in confirm attendance', error)
        } finally {
            setIsConfirmingAttendance(false)
        }
    }

    useEffect(() => {
        fetchTripData()
    }, [])

    if (isLoadingTrip) {
        return <Loading/>
    }
    return (
        <View className="flex-1 px-5 pt-16">
            <Input variant="tertiary">
                <MapPin color={colors.zinc[400]} size={20}/>
                <Input.Field value={tripData.when} readOnly/>

                <TouchableOpacity 
                activeOpacity={0.6} 
                className="w-9 h-9 bg-zinc-800 items-center justify-center rounded-md"
                onPress={() => setIsModalVisible(MODAL.UPDATE_TRIP)}
                >
                    <Settings2 color={colors.zinc[400]} size={20}/>
                </TouchableOpacity>
            </Input>

            {
                options === 'activity' ? (
                    <Activities tripData={tripData}/>
                ) : (
                    <Details tripId={tripData.id}/>
                )
            }

            <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
                <View className="w-full flex-row bg-zinc-900 self-center border-zinc-800 gap-2 p-4 rounded-lg">
                    <Button 
                    className="flex-1"
                    variant={options === 'activity' ? 'primary' : 'secondary'}
                    onPress={() => setOptions('activity')}
                    >
                        
                        <CalendarRange 
                        color={options === 'activity' ? colors.lime[950] : colors.zinc[200]}
                        size={20}
                        />
                        <Button.Title>Atividades</Button.Title>
                    </Button>
                    <Button 
                    className="flex-1"
                    variant={options === 'details' ? 'primary' : 'secondary'}
                    onPress={() => setOptions('details')}
                    >
                        <Info 
                        color={options === 'details' ? colors.lime[950] : colors.zinc[200]}
                        size={20}
                        />
                        <Button.Title>Detalhes</Button.Title>
                    </Button>
                </View>
            </View>

            <Modal
            title="Atualizar viagem"
            subtitle="Somente quem criou a viagem pode atualizá-la"
            visible={isModalVisible == MODAL.UPDATE_TRIP}
            onClose={() => setIsModalVisible(MODAL.NONE)}
            >
                <View className="gap-2 my-4">
                    <Input  variant="secondary">
                        <MapPin color={colors.zinc[400]} size={20}/>
                        <Input.Field 
                        placeholder="Para onde?"
                        onChangeText={setDestination}
                        value={destination} />
                    </Input>

                    <Input  variant="secondary">
                        <CalendarUpdateTrip color={colors.zinc[400]} size={20}/>
                        <Input.Field 
                        placeholder="Quando?"
                        value={datesSelected.formatDatesInText}
                        onPressIn={() => setIsModalVisible(MODAL.CALENDAR)}
                        onFocus={() => Keyboard.dismiss()} />
                    </Input>

                    <Button onPress={handleUpdateTrip} isLoading={isUpdating}>
                        <Button.Title>Atualizar</Button.Title>
                    </Button>
                </View>
            </Modal>

            <Modal 
            title='Selecionar datas'
            subtitle='Selecione a data de ida e volta de viagem'
            visible={isModalVisible === MODAL.CALENDAR}
            onClose={() => setIsModalVisible(MODAL.NONE)}
            >

                <View className='gap-4 mt-4'>
                    <Calendar
                    onDayPress={handleSelectDates}
                    markedDates={datesSelected.dates}
                    minDate={dayjs().toISOString()}

                    />

                    <Button onPress={() => setIsModalVisible(MODAL.UPDATE_TRIP)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>

                </View>
            </Modal>

            <Modal
                title="Confirmar presença"
                visible={showModal === MODAL.CONFIRM_ATTENDANCE}
            >
                <View className="gap-4 mt-4">
                <Text className="text-zinc-400 font-regular leading-6 my-2">
                    Você foi convidado (a) para participar de uma viagem para
                    <Text className="font-semibold text-zinc-100">
                    {" "}
                    {tripData.destination}{" "}
                    </Text>
                    nas datas de{" "}
                    <Text className="font-semibold text-zinc-100">
                    {dayjs(tripData.start_at).date()} a{" "}
                    {dayjs(tripData.end_at).date()} de{" "}
                    {dayjs(tripData.end_at).format("MMMM")}. {"\n\n"}
                    </Text>
                    Para confirmar sua presença na viagem, preencha os dados abaixo:
                </Text>

                <Input variant="secondary">
                    <User color={colors.zinc[400]} size={20} />
                    <Input.Field
                    placeholder="Seu nome completo"
                    onChangeText={setGuestName}
                    />
                </Input>

                <Input variant="secondary">
                    <Mail color={colors.zinc[400]} size={20} />
                    <Input.Field
                    placeholder="E-mail de confirmação"
                    onChangeText={setGuestEmail}
                    />
                </Input>

                <Button
                    isLoading={isConfirmingAttendance}
                    onPress={handleConfirmAttendance}
                >
                    <Button.Title>Confirmar minha presença</Button.Title>
                </Button>
                </View>
            </Modal>
        </View>
    )
}