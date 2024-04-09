import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useSearchParams } from 'next/navigation';
import { useContext, useState } from 'react';
import { ISendVerificationEmail } from '../app/api/emails/send-verification/route';
import UserContext from '../modules/BuilderPlace/context/UserContext';
import { createVerificationEmailToast } from '../modules/BuilderPlace/utils/toast';
import { showErrorTransactionToast } from '../utils/toast';
import Notification from './Notification';

type VerifyEmailNotificationProps = {
  callback?: () => void | Promise<void>;
};

const VerifyEmailNotification = ({ callback }: VerifyEmailNotificationProps) => {
  const { user } = useContext(UserContext);
  const searchParams = useSearchParams();
  const domainParam = searchParams?.get('domain');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState(true);
  const sendVerificationEmailMutation = useMutation({
    mutationFn: async (
      body: ISendVerificationEmail,
    ): Promise<AxiosResponse<{ id: string; message: string }>> => {
      return await axios.post('/api/emails/send-verification', body);
    },
  });

  const onVerifyMail = async () => {
    const domain = typeof domainParam === 'object' && !!domainParam ? domainParam[0] : domainParam;
    if (user?.email && !user.isEmailVerified && user?.id && domain) {
      try {
        setSubmitting(true);
        await sendVerificationEmailMutation.mutateAsync({
          userId: user.id.toString(),
          domain: domain,
          name: user.name,
          to: user.email,
        });

        await createVerificationEmailToast();

        setShowNotification(false);

        if (callback) {
          await callback();
        }
      } catch (err: any) {
        showErrorTransactionToast(err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!user?.email || user?.isEmailVerified || !showNotification) {
    return null;
  }

  return (
    <Notification
      title='Verify your email!'
      text='Needed to activate email notifications'
      link=''
      linkText={'Verify my email'}
      color='success'
      submitting={submitting}
      imageUrl={user.picture}
      callback={onVerifyMail}
    />
  );
};

export default VerifyEmailNotification;
