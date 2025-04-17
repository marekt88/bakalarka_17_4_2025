'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Sale', value: 80 },
  { name: 'Distribute', value: 10 },
  { name: 'Return', value: 10 },
]

const COLORS = ['#3b82f6', '#eab308', '#ef4444']

export function AnalyticsChart() {
  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <CardTitle className="text-white">Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">80%</div>
              <div className="text-sm text-white/70">Transactions</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-sm text-white/70">{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

