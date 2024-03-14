import Image from 'next/image';
import { ReactNode, useContext } from 'react';
import TalentLayerContext from './../context/talentLayer';
import OnboardingSteps from './OnboardingSteps';
import Link from 'next/link';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  step: number;
}

function HirerProfileLayout({ children, className, step }: ContainerProps) {
  const { account, user } = useContext(TalentLayerContext);

  return (
    <div className=''>
      <header className='navbar w-full border-stroke bg-white duration-300'>
        <div className='container relative lg:max-w-[1305px] lg:px-10'>
          <div className='flex items-center justify-between h-[80px]'>
            <div className='block py-4 lg:py-0'>
              <Link href='/' className='block max-w-[145px] sm:max-w-[200px]'>
                <Image src='/logo-text-dark.png' alt='logo' width={256} height={41} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div>
        <OnboardingSteps currentStep={step} type='hirer' />
        <div className={`${className}`}>
          <div className=''>
            <p className=' pb-5 sm:pb-10 pt-5 text-3xl sm:text-5xl font-bold mt-6 text-center'>
              {step === 1
                ? 'create your organization profile'
                : step === 2
                ? 'create your on-chain organization identity'
                : 'configure your place'}
            </p>

            <div className=' pb-16 max-w-3xl transition-all duration-300 rounded-md mx-auto'>
              <div className='p-6 mx-auto'>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HirerProfileLayout;
