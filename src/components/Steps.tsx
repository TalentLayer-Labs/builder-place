import { useContext } from 'react';
import TalentLayerContext from '../context/talentLayer';
import ConnectBlock from './ConnectBlock';
import Loading from './Loading';
import OnboardingRedirectButton from './RedirectToOnboardingButton';

function Steps({ handle }: { handle?: string }) {
  const { account, loading, user } = useContext(TalentLayerContext);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='max-w-7xl mx-auto text-base-content'>
      <div className='flex items-center justify-center w-full flex-col'>
        {!account?.isConnected && (
          <div className='p-8 flex flex-col items-center'>
            <ConnectBlock />
          </div>
        )}
        {/*{account?.isConnected && !user && <TalentLayerIdForm handle={handle} />}*/}
        {account?.isConnected && !user && <OnboardingRedirectButton />}
      </div>
    </div>
  );
}

export default Steps;
