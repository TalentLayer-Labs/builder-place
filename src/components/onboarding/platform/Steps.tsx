function Steps({ currentStep }: { currentStep: number }) {
  const getCircleColor = (step: number) => {
    if (step === currentStep) {
      return 'bg-pink-500';
    } else {
      return 'bg-pink-200';
    }
  };

  return (
    <div className='mt-6 flex justify-center items-center '>
      <div className='flex-1 md:flex-initial md:w-3/4 border-2 bg-base-100 border-solid border-opacity-10 border-info rounded-2xl p-3 sm:p-4 mx-4 sm:mx-6'>
        <div className='flex flex-row'>
          <div className='flex-1 border-r border-dark bg-base-100 flex items-center justify-center'>
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 p-2 rounded-full flex items-center justify-center ${getCircleColor(
                1,
              )}`}>
              <div className='text-white text-md sm:text-xl font-semibold'>1</div>
            </div>
            <div className='ml-3 flex flex-col'>
              <div className='text-light text-md sm:text-xl font-semibold leading-6'>create</div>
              <div className='text-light text-xs sm:text-sm'>your profile</div>
            </div>
          </div>
          <div className='flex-1 bg-base-100 flex items-center justify-center'>
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 p-2 rounded-full flex items-center justify-center ${getCircleColor(
                2,
              )}`}>
              <div className='text-white text-md sm:text-xl font-semibold'>2</div>
            </div>
            <div className='ml-3 flex flex-col'>
              <div className='text-light text-md sm:text-xl font-semibold leading-6'>create</div>
              <div className='text-light text-xs sm:text-sm'>your platform</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Steps;
