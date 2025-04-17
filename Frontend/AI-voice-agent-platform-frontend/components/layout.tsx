import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutGrid, Users, FileText, Settings } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onCreateAssistant: () => void;
}

export function Sidebar({ className, onCreateAssistant }: SidebarProps) {
  return (
    <div className={cn("pb-12 min-h-screen bg-white", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary bg-primary/10 transition-all duration-300 hover:scale-105 hover:bg-primary/20 hover:shadow-md"
            >
              <LayoutGrid className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/assistants"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:text-primary hover:shadow-md"
            >
              <Users className="h-4 w-4" />
              Assistants
            </Link>
            <Link
              href="/files"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:text-primary hover:shadow-md"
            >
              <FileText className="h-4 w-4" />
              Files
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-auto px-3">
        <Button 
          className="w-full justify-start gap-2 mb-4 border-2 border-primary text-primary transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:shadow-md" 
          variant="ghost"
          onClick={onCreateAssistant}
        >
          <Users className="h-4 w-4" />
          Create new assistant
        </Button>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:text-primary hover:shadow-md"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 mt-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>EA</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Easin Arafat</span>
            <span className="text-xs text-muted-foreground">Free Account</span>
          </div>
        </div>
      </div>
    </div>
  )
}

