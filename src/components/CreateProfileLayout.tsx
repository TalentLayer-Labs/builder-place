import { ReactNode, useContext } from 'react';
import TalentLayerContext from './../context/talentLayer';
import Steps from './Steps';
import OnboardingSteps from './OnboardingSteps';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

function CreateProfileLayout({ children, className }: ContainerProps) {
  const { account, user } = useContext(TalentLayerContext);

  if (!account?.isConnected || !user) {
    return <Steps />;
  }

  return (
    <>
      <OnboardingSteps currentStep={2} />
      <div className={`${className}`}>
        <div className='text-stone-800'>
          <p className='pb-10 pt-5 text-4xl font-bold mt-6 text-center'>
            Create Your Worker Profile
          </p>
        
          {account?.isConnected && user && (
              <div className=' pb-16 max-w-7xl transition-all duration-300 rounded-md mx-auto'>
                <div className='border border-redpraha rounded-xl p-6 mx-auto'>{children}</div>
              </div>
          )}
          </div>
        </div>
    </>
  );
}

export default CreateProfileLayout;
