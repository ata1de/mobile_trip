import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { colors } from '@/styles/colors';
import { ArrowRight, Calendar as IconCalendar, MapPin, Settings2, UserRoundPlus } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';


export default function Home() {
    return (
        <View className='flex-1 items-center justify-center px-5'>
            <Image source={require('@/assets/logo.png')} className='h-9' resizeMode='contain'/>

            <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>Convide seus amigos para a sua{"\n"}próxima viagem</Text>

            <View className='w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800'>
                <Input>
                    <MapPin color={colors.zinc[400]} size={20}/>
                    <Input.Field placeholder='Para onde?'/>
                </Input>

                <Input>
                    <IconCalendar color={colors.zinc[400]} size={20}/>
                    <Input.Field placeholder='Quando?'/>
                </Input>

                <View className='py-3 border-b border-zinc-800'>
                    <Button variant='secondary'>
                        <Button.Title>Alterar local/data</Button.Title>
                        <Settings2 color={colors.zinc[200]} size={20}/>
                    </Button>
                </View>

                <Input>
                    <UserRoundPlus color={colors.zinc[400]} size={20}/>
                    <Input.Field placeholder='Quem estará na viagem?'/>
                </Input>

                <Button >
                        <Button.Title>Continuar</Button.Title>
                        <ArrowRight color={colors.lime[950]} size={20}/>
                    </Button>
            </View>

            <Text className='text-zinc-500 font-regular text-base text-center'>
                Ao planejar sua viagem pela plann.er você automaticamente concorda com os nossos{" "}<Text className='text-zinc-200 underline'>termos de uso e politicas de privacidade</Text>
            </Text>

        </View>
    )
}