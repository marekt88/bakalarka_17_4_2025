interface ProcessStep {
  number: number;
  description: string;
}

interface ProcessStepsProps {
  steps: ProcessStep[];
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <div key={step.number} className="flex gap-4 text-white/90">
          <span className="text-xl font-medium">{step.number}.</span>
          <p className="text-xl">{step.description}</p>
        </div>
      ))}
    </div>
  )
}

