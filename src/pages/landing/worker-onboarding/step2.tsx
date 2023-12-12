import CreateProfileLayout from '../../../components/CreateProfileLayout';
import CreateWorkerProfileForm from '../../../components/Form/CreateWorkerProfileForm';

function workerOnboardingStep2() {
  return (
    <CreateProfileLayout step={2}>
      <CreateWorkerProfileForm />
    </CreateProfileLayout>
  );
}

export default workerOnboardingStep2;
