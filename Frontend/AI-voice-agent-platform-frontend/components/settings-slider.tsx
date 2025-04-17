'use client'

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SettingsSliderProps {
  label: string;
  tooltip?: string;
  min: number;
  max: number;
  step?: number;
  value: number[];
  onChange: (value: number[]) => void;
  unit?: string;
  showValue?: boolean;
}

export function SettingsSlider({
  label,
  tooltip,
  min,
  max,
  step = 0.1,
  value,
  onChange,
  unit = "",
  showValue = true,
}: SettingsSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">{label}</span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-white/40" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {showValue && (
          <span className="text-sm text-white/70">{value[0]}{unit}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-white/40">{min}{unit}</span>
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onValueChange={onChange}
          className="flex-1"
        />
        <span className="text-xs text-white/40">{max}{unit}</span>
      </div>
    </div>
  )
}

