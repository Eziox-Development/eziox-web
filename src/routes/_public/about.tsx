import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  User,
  Code,
  Briefcase,
  Mail,
  Github,
  Calendar,
  Award,
  Zap,
  Heart,
  ArrowUpRight,
} from 'lucide-react'
import { FaDiscord } from 'react-icons/fa'

export const Route = createFileRoute('/_public/about')({
  component: AboutPage,
})

function AboutPage() {
  const skills = [
    {
      category: 'Frontend',
      items: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'TanStack'],
    },
    {
      category: 'Backend',
      items: ['Node.js', 'Bun', 'Appwrite', 'PostgreSQL', 'REST APIs'],
    },
    {
      category: 'Tools',
      items: ['Git', 'Docker', 'Vite', 'ESLint', 'Prettier'],
    },
  ]

  const experience = [
    {
      title: 'Full Stack Developer',
      company: 'Novaplex',
      period: '2023 - Present',
      description:
        'Building modern web applications with React, TypeScript, and Node.js',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 space-y-20"
    >
      {/* Background decorations */}
      <div
        className="absolute top-20 left-0 w-96 h-96 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute top-1/3 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center space-y-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
          }}
        >
          <User size={18} style={{ color: 'var(--primary-foreground)' }} />
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--primary-foreground)' }}
          >
            About Me
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight"
          style={{
            background:
              'linear-gradient(135deg, var(--foreground), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)',
          }}
        >
          Hi, I'm Saito
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
          style={{
            color: 'var(--foreground-muted)',
            fontFamily: 'var(--font-body)',
          }}
        >
          A passionate{' '}
          <span
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
            }}
          >
            Full Stack Developer
          </span>{' '}
          who loves building modern, scalable web applications with cutting-edge
          technologies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <motion.a
            href="mailto:saito@novaplex.xyz"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'var(--primary-foreground)',
              boxShadow:
                '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail size={18} />
            Get in Touch
            <ArrowUpRight size={16} />
          </motion.a>
          <motion.a
            href="https://github.com/XSaitoKungX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github size={18} />
            GitHub
          </motion.a>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -5 }}
          className="group relative p-8 rounded-3xl space-y-5 overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Glow effect on hover */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
          />
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary), var(--accent))',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Code size={28} style={{ color: 'var(--primary-foreground)' }} />
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-display)',
              }}
            >
              What I Do
            </h2>
          </div>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--foreground-muted)' }}
          >
            I specialize in building modern web applications using React,
            TypeScript, and Node.js. I'm passionate about creating intuitive
            user experiences and writing clean, maintainable code.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5 }}
          className="group relative p-8 rounded-3xl space-y-5 overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Glow effect on hover */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
            style={{
              background:
                'linear-gradient(135deg, var(--accent), var(--primary))',
            }}
          />
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-xl"
              style={{
                background:
                  'linear-gradient(135deg, var(--accent), var(--primary))',
              }}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Zap size={28} style={{ color: 'var(--primary-foreground)' }} />
            </motion.div>
            <h2
              className="text-2xl font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              My Approach
            </h2>
          </div>
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--foreground-muted)' }}
          >
            I believe in writing code that is not only functional but also
            elegant and efficient. I stay up-to-date with the latest
            technologies and best practices to deliver top-quality solutions.
          </p>
        </motion.div>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative space-y-8"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Award size={24} style={{ color: 'var(--primary-foreground)' }} />
          </motion.div>
          <h2
            className="text-3xl font-bold"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Skills & Technologies
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map((skillGroup, index) => (
            <motion.div
              key={skillGroup.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
              whileHover={{ y: -5 }}
              className="group relative p-6 rounded-2xl space-y-4 overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background:
                    'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              />
              <h3
                className="text-xl font-bold"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillGroup.items.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.4 + index * 0.1 + skillIndex * 0.05,
                    }}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Experience Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative space-y-8"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <Briefcase
              size={24}
              style={{ color: 'var(--primary-foreground)' }}
            />
          </motion.div>
          <h2
            className="text-3xl font-bold"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Experience
          </h2>
        </div>

        <div className="relative space-y-6">
          {/* Timeline line */}
          <div
            className="absolute left-[11px] top-6 bottom-6 w-0.5 rounded-full hidden sm:block"
            style={{
              background:
                'linear-gradient(180deg, var(--primary), var(--accent))',
            }}
          />

          {experience.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
              whileHover={{ x: 8 }}
              className="group relative sm:pl-10"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-0 top-6 w-6 h-6 rounded-full hidden sm:flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary), var(--accent))',
                  boxShadow:
                    '0 0 15px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--primary-foreground)' }}
                />
              </div>

              <div
                className="relative p-6 rounded-2xl space-y-3 overflow-hidden"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Left gradient accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--primary), var(--accent))',
                  }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3
                    className="text-xl font-bold"
                    style={{
                      color: 'var(--foreground)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {exp.title}
                  </h3>
                  <div
                    className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--primary), var(--accent))',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    <Calendar size={12} />
                    {exp.period}
                  </div>
                </div>
                <p
                  className="font-semibold"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--primary), var(--accent))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {exp.company}
                </p>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative text-center space-y-8 py-16 px-8 rounded-3xl overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(circle at center, var(--primary), transparent 70%)',
          }}
        />

        {/* Sparkle icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
          className="relative mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, var(--primary), var(--accent))',
            boxShadow: '0 0 30px rgba(var(--primary-rgb, 99, 102, 241), 0.4)',
          }}
        >
          <Heart size={28} style={{ color: 'var(--primary-foreground)' }} />
        </motion.div>

        <h2
          className="relative text-3xl sm:text-4xl font-bold"
          style={{
            background:
              'linear-gradient(135deg, var(--foreground), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)',
          }}
        >
          Let's Work Together
        </h2>
        <p
          className="relative text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--foreground-muted)' }}
        >
          I'm always open to discussing new projects, creative ideas, or
          opportunities to be part of your visions.
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-4 pt-4">
          <motion.a
            href="mailto:saito@novaplex.xyz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background:
                'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'var(--primary-foreground)',
              boxShadow:
                '0 4px 20px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail size={18} />
            Email Me
          </motion.a>
          <motion.a
            href="https://github.com/XSaitoKungX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github size={18} />
            GitHub
          </motion.a>
          <motion.a
            href="https://discord.com/users/848917797501141052"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaDiscord size={18} />
            Discord
          </motion.a>
        </div>
      </motion.section>
    </motion.div>
  )
}
