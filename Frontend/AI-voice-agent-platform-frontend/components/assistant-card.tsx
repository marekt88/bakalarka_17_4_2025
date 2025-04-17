'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Pen } from 'lucide-react'

interface AssistantCardProps {
  id: string
  name: string
  description: string
  imageUrl: string
}

export function AssistantCard({ id, name, description, imageUrl }: AssistantCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/edit-manually?id=${id}`)
  }

  return (
    <div 
      className="relative rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={imageUrl}
        alt={name}
        width={300}
        height={200}
        className={`w-full h-[200px] object-cover transition-all duration-300 ${isHovered ? 'brightness-50' : ''}`}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={handleEdit}
            className="bg-white text-black hover:bg-white/90 transition-all duration-300"
          >
            <Pen className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      )}
    </div>
  )
}

