'use client'

import { Button } from "@/components/ui/button"

interface ToggleButtonsProps {
  activeOption: 'test' | 'edit';
  onToggle: (option: 'test' | 'edit') => void;
}

export function ToggleButtons({ activeOption, onToggle }: ToggleButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-white/5">
      <Button
        variant="ghost"
        className={`rounded-md text-lg font-medium ${
          activeOption === 'test'
            ? 'bg-purple-500/20 text-purple-300'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        onClick={() => onToggle('test')}
      >
        TEST WITH ALICE
      </Button>
      <Button
        variant="ghost"
        className={`rounded-md text-lg font-medium ${
          activeOption === 'edit'
            ? 'bg-purple-500/20 text-purple-300'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
        onClick={() => onToggle('edit')}
      >
        EDIT MANUALLY
      </Button>
    </div>
  )
}

