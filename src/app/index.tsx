import { Button } from '@/components/button';
import { Calendar } from '@/components/calendar';
import { GuestEmail } from '@/components/email';
import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Modal } from '@/components/modal';
import { tripServer } from '@/server/trip-server';
import { tripStorage } from '@/storage/trip';
import { colors } from '@/styles/colors';
import { calendarUtils, DatesSelected } from '@/utils/calendarUtils';
import { validateInput } from '@/utils/validateInput';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { ArrowRight, AtSign, Calendar as IconCalendar, MapPin, Settings2, UserRoundPlus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, Text, View } from 'react-native';
import { DateData } from 'react-native-calendars';

enum StepForm {
    TRIP_DETAILS = 1,
    ADD_EMAIL = 2,
}

enum MODAL {
    NONE = 0,
    CALENDAR = 1,
    GUESTS = 2
}

export default function Home() {
    // Loading
    const [isCreatingTrip, setIsCreatingTrip] = useState(false)
    const [isGettingTrip, setIsGettingTrip] = useState(true)

    const [stepForm, setStepForm] = useState<StepForm>(StepForm.TRIP_DETAILS)
    const [datesSelected, setDatesSelected] = useState({} as DatesSelected)
    const  [destination, setDestination] = useState('')
    const [emailToInvite, setEmailToInvite] = useState('')
    const [emailsInvited, setEmailsInvited] = useState<string[]>([])

    // MODAL
    const [isModalVisible, setIsModalVisible] = useState(MODAL.NONE)

    function handleSelectDates(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: datesSelected.startsAt,
            endsAt: datesSelected.endsAt,
            selectedDay
        })

        setDatesSelected(dates)
    }

    function handleNextStepForm() {
        if (destination.trim().length === 0 || !datesSelected.startsAt || !datesSelected.endsAt) {
            return Alert.alert(
            'Detalhes da viagem',
            'Preencha todos os campos')
        }

        if (destination.length < 4) {
            return Alert.alert(
            'Detalhes da viagem',
            'O destino deve conter no mínimo 4 caracteres')
        }

        if (stepForm === StepForm.TRIP_DETAILS) {
            return setStepForm(StepForm.ADD_EMAIL)
        }

        Alert.alert('Nova viagem', 'Deseja confirmar a viagem?', [
            {
                text: 'Cancelar',
                'style': 'cancel'
            },
            {
                text: 'Confirmar',
                onPress: () => handleCreateTrip()
            }
        ])
    }

    function handleRemoveEmail(email: string) {
        setEmailsInvited(emailsInvited.filter((emailInvite) => emailInvite !== email))
    }

    async function saveTrip(tripId: string) {
        try {
            await tripStorage.save(tripId)
            router.navigate(`/trip/${tripId}`)
        } catch (error) {
            Alert.alert('Salvar viagem', 'Não foi possível salvar a viagem')

            console.log(error)
        }
    }

    async function handleCreateTrip() {

        try {
            setIsCreatingTrip(true)

            const newTrip = await tripServer.createTrip({
                destination,
                emails_to_invite: emailsInvited,
                end_at: dayjs(datesSelected.endsAt?.dateString).format('YYYY-MM-DD HH:mm:ss'),
                start_at: dayjs(datesSelected.startsAt?.dateString).format('YYYY-MM-DD HH:mm:ss')
            })
          
            Alert.alert('Nova viagem', 'Viagem criada com sucesso', [
                {
                    text: 'Ok',
                    onPress: () => saveTrip(newTrip.tripId)
                }
            ])
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    function handleInviteGuests() {
        if (!validateInput.email(emailToInvite)) {
            return Alert.alert('E-mail', 'E-mail inválido')
        }
        
        const emailAlreadyExists = emailsInvited.find((email) => email === emailToInvite)
        
        if (emailAlreadyExists) {
            return Alert.alert('E-mail', 'E-mail já adicionado')
        }
        
        setEmailsInvited([...emailsInvited, emailToInvite])
    }
    
    async function getTrip() {
        try {
            const tripId = await tripStorage.get()

            if (!tripId) {
                console.log('error in get tripId storage')
                return setIsGettingTrip(false)
            }

            const trip = await tripServer.getTripDetails(tripId)
            

            if (trip) {
                router.navigate(`/trip/${trip.id}`)
            }
        } catch (error) {
            setIsGettingTrip(false)
            console.log('Error getting trip', error)
        }
    }

    useEffect(() => {
        getTrip()
    }, [])

    
    if(isGettingTrip) {
        return <Loading/>
    }
    return (
        <View className='flex-1 items-center justify-center px-5'>
            <Image source={require('@/assets/logo.png')} className='h-9' resizeMode='contain'/>

            <Image source={require('@/assets/bg.png')} className='absolute'/>

            <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>Convide seus amigos para a sua{"\n"}próxima viagem</Text>

            <View className='w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800'>
                <Input>
                    <MapPin color={colors.zinc[400]} size={20}/>
                    <Input.Field 
                    placeholder='Para onde?' 
                    editable={stepForm === StepForm.ADD_EMAIL ? false : true}
                    onChangeText={setDestination}
                    value={destination}
                    />
                </Input>

                <Input>
                    <IconCalendar color={colors.zinc[400]} size={20}/>
                    <Input.Field 
                    placeholder='Quando?' 
                    editable={stepForm === StepForm.ADD_EMAIL ? false : true}
                    onFocus={() => Keyboard.dismiss()}
                    showSoftInputOnFocus={false}
                    onPressIn={() =>  stepForm === StepForm.TRIP_DETAILS && setIsModalVisible(MODAL.CALENDAR)}
                    value={datesSelected.formatDatesInText}
                    />
                </Input>

                {stepForm === StepForm.ADD_EMAIL && (
                    <View>
                        <View className='py-3 border-b border-zinc-800'>
                            <Button 
                            variant='secondary' 
                            onPress={() => setStepForm(StepForm.TRIP_DETAILS)}
                            >
                                <Button.Title>Alterar local/data</Button.Title>
                                <Settings2 color={colors.zinc[200]} size={20}/>
                            </Button>
                        </View>

                        <Input>
                            <UserRoundPlus color={colors.zinc[400]} size={20}/>
                            <Input.Field 
                            placeholder='Quem estará na viagem?'
                            onPressIn={() => setIsModalVisible(MODAL.GUESTS)}
                            onFocus={() => Keyboard.dismiss()}
                            autoCorrect={false}
                            value={
                                emailsInvited.length > 0 
                                ? `${emailsInvited.length} pessoa(s) convidada(s)` :
                                ''
                            }showSoftInputOnFocus={false}
                            />
                        </Input>
                    </View>
                )}
                

                <Button onPress={handleNextStepForm} isLoading={isCreatingTrip}>
                        <Button.Title>
                            {stepForm === StepForm.TRIP_DETAILS ? 'Continuar' : 'Confirmar Viagem'}
                        </Button.Title>
                        <ArrowRight color={colors.lime[950]} size={20}/>
                </Button>
            </View>

            <Text className='text-zinc-500 font-regular text-base text-center'>
                Ao planejar sua viagem pela plann.er você automaticamente concorda com os nossos{" "}<Text className='text-zinc-200 underline'>termos de uso e politicas de privacidade</Text>
            </Text>

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

                    <Button onPress={() => setIsModalVisible(MODAL.NONE)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>

                </View>
            </Modal>

            <Modal 
            title='Adicionar convidados'
            subtitle='Os convidados irão receber um e-mail para confimar sua participação na viagem'
            visible={isModalVisible === MODAL.GUESTS}
            onClose={() => setIsModalVisible(MODAL.NONE)}
            
            >
                <View className='my-2 flex-wrap gap-2 border-b border-zinc-800 py-5 items-start'>
                    {
                        emailsInvited.length > 0 ? (
                            emailsInvited.map((email) => (
                                <GuestEmail key={email} email={email} onRemove={() => handleRemoveEmail(email)}/>
                            ))
                        ) : (
                            <Text className='text-zinc-400 font-regular text-base'>Nenhum convidado adicionado</Text>
                        )
                    }
                </View>

                <View className='gap-4 mt-4'>
                    <Input variant='secondary'>
                        <AtSign color={colors.zinc[400]} size={20}/>
                        <Input.Field 
                        placeholder='Digite o e-mail do convidado'
                        keyboardType='email-address'
                        onChangeText={setEmailToInvite}
                        value={emailToInvite}
                        returnKeyType='send'
                        onSubmitEditing={handleInviteGuests}
                        />
                    </Input>

                    <Button
                    onPress={() => handleInviteGuests()}
                    >
                        <Button.Title>Adicionar</Button.Title>
                    </Button>
                </View>
            </Modal>

        </View>
    )
}