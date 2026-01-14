import * as React from 'react'
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Lock } from 'lucide-react'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, var(--accent) 0%, transparent 50%),
                      var(--background)`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card
          className="backdrop-blur-sm border-2 shadow-2xl"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Icon with gradient background */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, var(--primary), var(--accent))`,
              }}
            >
              <Lock
                className="w-8 h-8"
                style={{ color: 'var(--primary-foreground)' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle
                className="text-2xl md:text-3xl font-bold"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {title}
              </CardTitle>
              <CardDescription
                className="text-sm md:text-base mt-2"
                style={{
                  color: 'var(--foreground-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {description}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {children}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
