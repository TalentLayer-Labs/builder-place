import ToastStep from './ToastStep';

interface Step {
  title: string;
  status: 'complete' | 'current' | 'upcoming';
  render?: () => JSX.Element;
}

export interface IMessages {
  step1: string;
  step2: string;
}

function TwoStepsTransactionToast({
  currentStep,
  messages,
}: {
  currentStep: number;
  messages: IMessages;
}) {
  const steps: Step[] = [
    {
      title: messages.step1,
      status: currentStep > 1 ? 'complete' : 'current',
    },
    {
      title: messages.step2,
      status: currentStep > 2 ? 'complete' : currentStep == 2 ? 'current' : 'upcoming',
    },
  ];

  return (
    <div className='py-6 px-2'>
      <nav className='flex' aria-label='Progress'>
        <ol role='list' className='space-y-6'>
          {steps.map((step, index) => (
            <ToastStep key={index} title={step.title} status={step.status}>
              {step?.render || null}
            </ToastStep>
          ))}
        </ol>
      </nav>
    </div>
  );
}
export default TwoStepsTransactionToast;
