import { Image, Text, View } from 'react-native';


export default function Home() {
    return (
        <View className='flex-1 items-center justify-center'>
            <Image source={require('@/assets/logo.png')} className='h-9' resizeMode='contain'/>

            <Text className='text-zinc-400 font-regular text-center text-lg mt-3'>Convide seus amigos para a sua{"\n"}próxima viagem</Text>
        </View>
    )
}