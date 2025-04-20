'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Mic, Users, FileText, Zap } from 'lucide-react'
import { UnifiedVoiceAgent } from '@/components/UnifiedVoiceAgent'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1B1C1F] text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">VoiceAgent Platform</h1>
        <nav>
          <Button asChild variant="ghost" className="text-white hover:text-white/80">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="ml-4 bg-purple-600 hover:bg-purple-700">
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Create AI Voice Agents with Ease</h2>
          <p className="text-xl text-white/70 mb-8">Build, customize, and deploy intelligent voice assistants for your business</p>
          
          <div className="flex flex-col items-center mb-8">
            {/* Use RAG-enabled assistant */}
            <div className="w-full max-w-md">
              <UnifiedVoiceAgent assistantName="ALICE" assistantType="landing_rag" />
            </div>
            <p className="text-lg text-white/70 mt-4">Give it a try (RAG-enabled)</p>
          </div>

          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link href="/dashboard">Start building for free</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Mic className="w-10 h-10" />}
            title="Voice Integration"
            description="Seamlessly integrate voice capabilities into your applications"
          />
          <FeatureCard
            icon={<Users className="w-10 h-10" />}
            title="Multiple Assistants"
            description="Create and manage multiple AI assistants for different tasks"
          />
          <FeatureCard
            icon={<FileText className="w-10 h-10" />}
            title="Knowledge Base"
            description="Upload and utilize custom knowledge bases for your assistants"
          />
          <FeatureCard
            icon={<Zap className="w-10 h-10" />}
            title="Quick Deployment"
            description="Deploy your voice agents with just a few clicks"
          />
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-white/50">
        <p>&copy; 2023 VoiceAgent Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-6 text-center">
      <div className="flex justify-center items-center mb-4 text-purple-500">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  )
}

