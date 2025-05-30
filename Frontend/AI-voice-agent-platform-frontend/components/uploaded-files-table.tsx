import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: string
  status: 'generating' | 'ready'
  type: string
}

interface UploadedFilesTableProps {
  files: UploadedFile[]
  onEditFAQ: (id: string) => void
  onGenerateFAQ: (id: string) => void
}

export function UploadedFilesTable({ files, onEditFAQ, onGenerateFAQ }: UploadedFilesTableProps) {
  return (
    <div className="bg-white/5 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-white/70">ID</TableHead>
            <TableHead className="text-white/70">File name</TableHead>
            <TableHead className="text-white/70">Size</TableHead>
            <TableHead className="text-white/70 text-right">Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="hover:bg-white/5">
              <TableCell className="text-white/70">{file.id}</TableCell>
              <TableCell className="font-medium text-white">{file.name}</TableCell>
              <TableCell className="text-white/70">{file.size}</TableCell>
              <TableCell className="text-right text-white/70">{file.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

