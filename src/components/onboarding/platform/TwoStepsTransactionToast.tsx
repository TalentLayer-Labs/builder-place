import ToastStep from '../../ToastStep';

interface Step {
  title: string;
  status: 'complete' | 'current' | 'upcoming';
  render?: () => JSX.Element;
}

function TwoStepsTransactionToast({ currentStep }: { currentStep: number }) {
  const steps: Step[] = [
    {
      title: 'Sign a message to authenticate with your wallet',
      status: currentStep > 1 ? 'complete' : 'current',
    },
    {
      title: 'Update your platform',
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