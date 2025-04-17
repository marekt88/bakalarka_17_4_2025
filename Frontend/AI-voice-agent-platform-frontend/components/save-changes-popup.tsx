'use client'

import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SaveChangesPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveChangesPopup({ isOpen, onClose }: SaveChangesPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={cn(
        "bg-[#1B1C1F] rounded-lg p-8 text-center transform transition-all duration-200",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        <h2 className="text-2xl font-bold text-white mb-6">
          The changes were saved
        </h2>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

