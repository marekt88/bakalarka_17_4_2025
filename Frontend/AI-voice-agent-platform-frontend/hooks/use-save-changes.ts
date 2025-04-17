'use client'

import { useState } from 'react'

export function useSaveChanges() {
  const [isSaving, setIsSaving] = useState(false)
  const [showSavePopup, setShowSavePopup] = useState(false)

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowSavePopup(true)
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    showSavePopup,
    setShowSavePopup,
    handleSaveChanges
  }
}

