'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { time: '10am', value: 50 },
  { time: '11am', value: 30 },
  { time: '12pm', value: 60 },
  { time: '01am', value: 40 },
  { time: '02am', value: 55 },
  { time: '03am', value: 25 },
  { time: '04am', value: 30 },
  { time: '05am', value: 45 },
  { time: '06am', value: 60 },
  { time: '07am', value: 75 },
]

export function ReportsChart() {
  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <CardTitle className="text-white">Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff70" />
              <YAxis stroke="#ffffff70" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1B1C1F', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#ffffff70' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#1B1C1F', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

