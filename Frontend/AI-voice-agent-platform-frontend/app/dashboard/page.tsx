'use client'

import { useState } from 'react'
import { Sidebar } from "@/components/layout"
import { MetricCards } from "@/components/metric-cards"
import { ReportsChart } from "@/components/reports-chart"
import { AnalyticsChart } from "@/components/analytics-chart"
import { AssistantsTable } from "@/components/assistants-table"
import { CreateAssistantModal } from "@/components/create-assistant-modal"

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateAssistant = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-[#1B1C1F]">
      <Sidebar className="w-64" onCreateAssistant={handleCreateAssistant} />
      <div className="flex-1 space-y-4 p-8 text-white">
        <div className="flex items-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <MetricCards />
        <div className="grid gap-4 grid-cols-4">
          <div className="col-span-3 bg-white/5 rounded-lg p-4">
            <ReportsChart />
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <AnalyticsChart />
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <AssistantsTable />
        </div>
      </div>
      <CreateAssistantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

