import Image from 'next/image';
import { ReactNode, useContext } from 'react';
import Link from 'next/link';
import OnboardingSteps from '../OnboardingSteps';
import Steps from './Steps';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  step: number;
}

function Layout({ children, className, step }: ContainerProps) {
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
        <Steps currentStep={step} />
        <div className={`${className}`}>
          <div className='text-stone-800'>
            <div className=' pb-16 max-w-3xl transition-all duration-300 rounded-md mx-auto'>
              <div className='p-6 mx-auto'>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
