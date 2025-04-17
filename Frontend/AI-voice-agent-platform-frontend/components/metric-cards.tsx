import { Card, CardContent } from "@/components/ui/card"
import { Clock, Phone, DollarSign } from 'lucide-react'

export function MetricCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white/5 border-0">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-white/10 rounded-full">
            <Clock className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">178</div>
            <div className="text-sm text-white/70">Called minutes</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-0">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-white/10 rounded-full">
            <Phone className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">20+</div>
            <div className="text-sm text-white/70">Number of calls</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-0">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-white/10 rounded-full">
            <DollarSign className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">190</div>
            <div className="text-sm text-white/70">Total spent</div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-0">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-2 bg-white/10 rounded-full">
            <DollarSign className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">12+</div>
            <div className="text-sm text-white/70">Average cost per call</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

