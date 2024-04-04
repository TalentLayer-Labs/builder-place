import { toast } from 'react-toastify';
import VerificationEmailToast from '../VerificationEmailToast';

export const createVerificationEmailToast = async (): Promise<void> => {
  toast(<VerificationEmailToast />, { autoClose: 5000, closeOnClick: true });
  return;
};
