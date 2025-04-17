'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Grid, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SaveChangesPopup } from '@/components/save-changes-popup'
import { useSaveChanges } from '@/hooks/use-save-changes'

export default function SettingsPage() {
  const { isSaving, showSavePopup, setShowSavePopup, handleSaveChanges } = useSaveChanges()
  const [name, setName] = useState('Easin Arafat')
  const [email, setEmail] = useState('easin@example.com')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [notifications, setNotifications] = useState(true)
  const [apiKey, setApiKey] = useState('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
  const [defaultVoice, setDefaultVoice] = useState('en-US-Standard-C')
  const [bio, setBio] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSaveChanges()
  }

  return (
    <div className="min-h-screen bg-[#1B1C1F] text-white">
      <SaveChangesPopup 
        isOpen={showSavePopup} 
        onClose={() => setShowSavePopup(false)} 
      />
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
          <Button 
            variant="outline" 
            className="gap-2 text-white border-white hover:bg-white/10"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="PST">PST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <Label htmlFor="notifications">Enable email notifications</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultVoice">Default Voice</Label>
            <Select value={defaultVoice} onValueChange={setDefaultVoice}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select default voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US-Standard-C">en-US-Standard-C</SelectItem>
                <SelectItem value="en-US-Standard-E">en-US-Standard-E</SelectItem>
                <SelectItem value="en-US-Standard-G">en-US-Standard-G</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              rows={4}
            />
          </div>
        </form>
      </main>
    </div>
  )
}

