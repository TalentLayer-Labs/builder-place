import CreatePlatformForm from '../../../../components/onboarding/platform/CreatePlatformForm';
import Steps from '../../../../components/onboarding/platform/Steps';

export default function CreatePlatformPage() {
  return (
    <>
      <Steps currentStep={2} />

      <div className='text-stone-800'>
        <div className='pb-16 max-w-3xl transition-all duration-300 rounded-md mx-auto'>
          <div className='p-6 mx-auto'>
            <p className=' pb-5 sm:pb-10 pt-5 text-3xl sm:text-5xl font-bold mt-3 sm:mt-6 text-center'>
              Create your platform
            </p>

            <CreatePlatformForm />
          </div>
        </div>
      </div>
    </>
  );
}
