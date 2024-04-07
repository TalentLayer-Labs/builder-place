'use client';

import { useRouter } from 'next/navigation';
import CreateUserForm from './CreateUserForm';

export default function OnboardingUserForm() {
  const router = useRouter();

  const onSuccess = () => {
    console.log('*DEBUG* onSuccess REDIRECT');
    router.push('/newonboarding/create-platform');
  };
  return <CreateUserForm onSuccess={onSuccess} />;
}
