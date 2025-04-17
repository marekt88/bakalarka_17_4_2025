interface Step {
  number: number;
  title: string;
  isActive?: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-between w-full bg-white/5 rounded-full p-2">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`flex items-center ${
            index !== steps.length - 1 ? 'flex-1' : ''
          }`}
        >
          <div
            className={`flex items-center justify-center ${
              step.isActive
                ? 'bg-white text-black'
                : 'bg-white/10 text-white/40'
            } rounded-full w-8 h-8 shrink-0`}
          >
            {step.number}
          </div>
          <div
            className={`${
              step.isActive ? 'text-white' : 'text-white/40'
            } ml-3 text-sm font-medium`}
          >
            {step.title}
          </div>
          {index !== steps.length - 1 && (
            <div className="flex-1 mx-4 h-px bg-white/10" />
          )}
        </div>
      ))}
    </div>
  );
}

