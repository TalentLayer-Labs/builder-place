import CreateProfileLayout from '../../../components/CreateProfileLayout';
import CreateWorkerProfileForm from '../../../components/Form/CreateWorkerProfileForm';

function workerOnboardingStep1() {
  const serviceId = new URL(window.location.href).searchParams.get('serviceId');

  return (
    <CreateProfileLayout step={1}>
      <CreateWorkerProfileForm />
    </CreateProfileLayout>
  );
}

export default workerOnboardingStep1;
