interface CodeDisplayProps {
  code: string;
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  return (
    <pre className="bg-[#0A0118] rounded-lg p-6 font-mono text-sm text-white/90 overflow-x-auto">
      <code>{code}</code>
    </pre>
  );
}

