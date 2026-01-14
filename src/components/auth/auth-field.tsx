import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface AuthFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label: string
  placeholder: string
  type?: string
  icon?: 'email' | 'password' | 'user'
}

const iconMap = {
  email: Mail,
  password: Lock,
  user: User,
}

export function AuthField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  icon,
}: AuthFieldProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false)
  const Icon = icon ? iconMap[icon] : null
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel
            className="text-sm font-medium"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon
                    className="w-4 h-4"
                    style={{
                      color: fieldState.error
                        ? 'var(--destructive)'
                        : 'var(--foreground-muted)',
                    }}
                  />
                </div>
              )}
              <Input
                className={`h-11 transition-all duration-200 ${
                  Icon ? 'pl-10' : 'pl-4'
                } ${isPassword ? 'pr-10' : 'pr-4'}`}
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: fieldState.error
                    ? 'var(--destructive)'
                    : 'var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-body)',
                }}
                type={inputType}
                placeholder={placeholder}
                {...field}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:opacity-70"
                  style={{ color: 'var(--foreground-muted)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage
            className="text-xs mt-1.5"
            style={{
              color: 'var(--destructive)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </FormItem>
      )}
    />
  )
}
