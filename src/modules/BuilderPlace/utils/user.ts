import { IUpdateProfileFormValues } from '../../../components/Form/ProfileForm';

export const containsOffChainProperties = (obj: IUpdateProfileFormValues): boolean => {
  const properties = ['title', 'role', 'image_url', 'video_url', 'name', 'about', 'skills'];

  for (const property of properties) {
    if (property in obj) {
      return true;
    }
  }

  return false;
};
