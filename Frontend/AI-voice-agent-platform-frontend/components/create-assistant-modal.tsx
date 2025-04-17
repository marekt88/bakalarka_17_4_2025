'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAssistantModal({ isOpen, onClose }: CreateAssistantModalProps) {
  const router = useRouter()
  const [assistantName, setAssistantName] = useState('')
  const [language, setLanguage] = useState('en')

  if (!isOpen) return null;

  const handleContinue = () => {
    if (assistantName) {
      router.push(`/choose-voice?name=${encodeURIComponent(assistantName)}`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[500px] relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-xl">Name your new assistant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Name of your assistant"
              className="w-full"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Choose a language</h3>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="w-full bg-gray-800 hover:bg-gray-700"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

