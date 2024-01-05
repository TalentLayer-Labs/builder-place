import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useValidateEmailMutation } from '../../modules/BuilderPlace/hooks/UseValidateEmailMutation';

const validateEmail = () => {
  const { mutateAsync: verifyEmailAsync } = useValidateEmailMutation();
  const router = useRouter();
  const { id } = router.query;
  const [pageResponse, setPageResponse] = useState('Missing Id');

  useEffect(() => {
    if (id) {
      setPageResponse('Loading...');
      verifyEmailAsync({
        userId: id.toString(),
      }).then(res => {
        if (res?.message) {
          setPageResponse(res.message);
        } else {
          setPageResponse('Something went wrong');
        }
      });
    }
  }, [id]);

  return (
    <>
      //TODO extract this in a dedicated component; create logic if missing ID of if didnt work:
      {/*"something went wrong, send another validation email ?"*/}
      <div className='bg-base-100'>
        <div className='max-w-7xl mx-auto text-base-content sm:px-4 lg:px-0 py-20'>
          <div className='flex flex-col items-center justify-center gap-10'>
            <p className='text-5xl sm:text-7xl font-bold tracking-wider max-w-5xl text-center'>
              Congratulations! 🎉
            </p>
            <p className='text-3xl sm:text-5xl font-medium tracking-wider max-w-5xl text-center'>
              Your email is validated!
            </p>
            <p className='text-xl sm:text-2xl text-base-content opacity-50 text-center'>
              You can now access cool features such as 50 free transactions per week.
            </p>
            <button
              className='bg-pink-500 text-content rounded-lg px-4 py-2 mt-4 text-lg text-white font-medium'
              onClick={() => console.log('Coucou')}>
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default validateEmail;
