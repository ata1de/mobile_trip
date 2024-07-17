import { ReactNode } from "react"
import { TextInput, View } from "react-native"

type Variants = 'primary' | 'secondary' | 'tertiary'

type InputProps = {
    children: ReactNode
    variant?: Variants
}

function Input({children, variant = 'primary'}: InputProps) {
    <View>{children}</View>
}


function Field () {
    <TextInput />
}

Input.Field = Field