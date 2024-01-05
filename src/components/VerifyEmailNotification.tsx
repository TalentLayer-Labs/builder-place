import Notification from './Notification';
import { sendVerificationEmail } from '../modules/BuilderPlace/request';
import { showMongoErrorTransactionToast } from '../utils/toast';
import { useContext } from 'react';
import TalentLayerContext from '../context/talentLayer';
import { useRouter } from 'next/router';

type VerifyEmailNotificationProps = {
  callback?: () => void | Promise<void>;
};

const VerifyEmailNotification = ({ callback }: VerifyEmailNotificationProps) => {
  const { user, workerProfile } = useContext(TalentLayerContext);
  const router = useRouter();
  //TODO deactivate after send to avoid ddos ?
  const onVerifyMail = async () => {
    const domain =
      typeof router.query.domain === 'object' && !!router.query.domain
        ? router.query.domain[0]
        : router.query.domain;
    if (workerProfile?.email && !workerProfile.emailVerified && user?.id && domain) {
      try {
        await sendVerificationEmail(
          workerProfile.email,
          workerProfile._id,
          workerProfile.name,
          domain,
        );
      } catch (e) {
        console.log('Error', e);
        showMongoErrorTransactionToast(e);
      }
      if (callback) {
        await callback();
      }
    }
  };

  return (
    <div>
      {!!workerProfile?.email && !workerProfile?.emailVerified && (
        <Notification
          title='Verify your email !'
          text='Tired of paying gas fees ? Verify your email and get gassless transactions !'
          link=''
          linkText={'Verify my email'}
          color='success'
          imageUrl={user?.description?.image_url}
          callback={onVerifyMail}
        />
      )}
    </div>
  );
};

export default VerifyEmailNotification;
