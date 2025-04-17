'use client'

import { useRouter } from 'next/navigation'
import { CreateAssistantModal } from "@/components/create-assistant-modal"

export default function CreateAssistantPage() {
  const router = useRouter()

  return (
    <CreateAssistantModal
      onClose={() => router.push('/')}
    />
  )
}

