'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Grid, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { AssistantCard } from '@/components/assistant-card'
import { CreateAssistantModal } from '@/components/create-assistant-modal'

const assistants = [
  {
    id: '1',
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries and support tickets',
    imageUrl: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '2',
    name: 'Sales Assistant',
    description: 'Assists with product information and sales inquiries',
    imageUrl: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '3',
    name: 'Technical Support',
    description: 'Provides technical assistance and troubleshooting',
    imageUrl: '/placeholder.svg?height=200&width=300'
  },
]

export default function AssistantsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#1B1C1F] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <Grid className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Assistants</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Assistant
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assistants.map((assistant) => (
            <AssistantCard key={assistant.id} {...assistant} />
          ))}
        </div>
      </main>

      <CreateAssistantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}

