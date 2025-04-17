import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const assistants = [
  {
    id: "#876364",
    name: "Customer Support Agent",
    callCount: "1200",
    duration: "25s",
    amount: "$1,46,660"
  },
  {
    id: "#876368",
    name: "Sales Assistant",
    callCount: "521",
    duration: "53s",
    amount: "$46,660"
  },
  {
    id: "#876412",
    name: "Technical Support",
    callCount: "62",
    duration: "78s",
    amount: "$3,46,676"
  },
]

export function AssistantsTable() {
  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <CardTitle className="text-white">Assistants based on call count</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white/70">Assistant ID</TableHead>
                <TableHead className="text-white/70">Assistant name</TableHead>
                <TableHead className="text-white/70">Call count</TableHead>
                <TableHead className="text-white/70">Average duration</TableHead>
                <TableHead className="text-white/70 text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.map((assistant) => (
                <TableRow key={assistant.id} className="hover:bg-white/5">
                  <TableCell className="text-white/70">{assistant.id}</TableCell>
                  <TableCell className="font-medium text-white">{assistant.name}</TableCell>
                  <TableCell className="text-white/70">{assistant.callCount}</TableCell>
                  <TableCell className="text-white/70">{assistant.duration}</TableCell>
                  <TableCell className="text-right text-white/70">{assistant.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

