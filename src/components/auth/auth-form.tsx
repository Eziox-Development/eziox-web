import * as React from 'react'
import { UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface AuthFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T, form: UseFormReturn<T>) => void
  children: (form: UseFormReturn<T>) => React.ReactNode
  submitText: string
  loadingText: string
  isLoading?: boolean
  className?: string
  form: UseFormReturn<T>
  successMessage?: string
}

export function AuthForm<T extends FieldValues>({
  onSubmit,
  children,
  submitText,
  loadingText,
  isLoading = false,
  className = 'space-y-5',
  form,
  successMessage,
}: AuthFormProps<T>) {
  const handleSubmit = (data: T) => {
    onSubmit(data, form)
  }

  const hasError = !!form.formState.errors.root
  const isSuccess = form.formState.isSubmitSuccessful && !hasError

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        {children(form)}

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {form.formState.errors.root?.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence mode="wait">
          {isSuccess && successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-2 p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, var(--primary), var(--accent))`,
            color: 'var(--primary-foreground)',
            fontFamily: 'var(--font-body)',
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{loadingText}</span>
            </div>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  )
}
