import { createContext, useContext } from "react";

import clsx from "clsx";
import { ActivityIndicator, Text, TextInputProps, TouchableOpacity, TouchableOpacityProps } from "react-native";

type Variants = 'primary' | 'secondary'

type ButtonProps = TouchableOpacityProps & {
    variant?: Variants
    isLoading?: boolean
}

const ThemeContext = createContext<{variant?: Variants}>({})

function Button({ children ,variant = 'primary', isLoading, className, ...props }: ButtonProps) {
    return <TouchableOpacity
     className={clsx("w-full h-11 flex justify-center items-center rounded-lg gap-2 flex-row ",
        {
            'bg-lime-300': variant === 'primary',
            'bg-zinc-800': variant === 'secondary',
        },
        className
    )}
    disabled={isLoading}
    activeOpacity={0.7}
    {...props}
     
    >
        <ThemeContext.Provider value={{variant}}>
            {isLoading ? <ActivityIndicator className="text-lime-950"/> : children}
        </ThemeContext.Provider>
    </TouchableOpacity>
}

function Title({ children }: TextInputProps) {
    const { variant } = useContext(ThemeContext)

    return <Text className={clsx("text-base font-semibold",
        {
            'text-lime-950': variant === 'primary',
            'text-zinc-200': variant === 'secondary',
        }
    )}>{children}</Text>
}

Button.Title = Title

export { Button };

