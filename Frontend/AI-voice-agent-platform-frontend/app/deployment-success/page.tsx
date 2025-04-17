'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Grid, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { CodeDisplay } from '@/components/code-display'

const WIDGET_CODE = `<script type="text/javascript">
(function(d, t) {
  var v = d.createElement(t), s = 
d.getElementsByTagName(t)[0];
  v.onload = function() {
    window.voiceflow.chat.load({
      verify: { projectID: '66cb8065fa85a760239045e7' },
      url: 'https://general-runtime.voiceflow.com',
      versionID: 'production'
    });
  }
  v.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
  v.type = "text/javascript";
  s.parentNode.insertBefore(v, s);
})(document, 'script');
</script>`

export default function DeploymentSuccessPage() {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(WIDGET_CODE)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 3000)
      })
      .catch(err => console.error('Failed to copy code:', err))
  }

  return (
    <div className="min-h-screen bg-[#1B1C1F] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <Grid className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-6 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-white/70 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/dashboard">
                <X className="h-4 w-4" />
                <span className="sr-only">Go to Dashboard</span>
              </Link>
            </Button>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 rounded-full p-2">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">YOUR VOICE AGENT IS LIVE</h1>
                  <p className="text-white/70">Here is your web widget code</p>
                </div>
              </div>

              <CodeDisplay code={WIDGET_CODE} />

              <div className="flex justify-end">
                <Button 
                  onClick={handleCopyCode}
                  className={`${
                    isCopied ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-600 hover:bg-purple-700'
                  } transition-colors`}
                >
                  {isCopied ? 'Copied!' : 'Copy to clipboard'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

