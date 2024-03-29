import { useContext } from 'react';
import { useAccount } from 'wagmi';
import UserContext from '../modules/BuilderPlace/context/UserContext';
import ConnectBlock from './ConnectBlock';
import Loading from './Loading';
import OnboardingRedirectButton from './OnboardingRedirectButton';

function Steps() {
  const { isConnected } = useAccount();
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className='flex items-center justify-center w-full flex-col'>
        {!isConnected && (
          <div className='p-8 flex flex-col items-center'>
            <ConnectBlock />
          </div>
        )}
        {isConnected && !user && <OnboardingRedirectButton />}
      </div>
    </div>
  );
}

export default Steps;
