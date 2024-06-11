import { IUpdateProfileFormValues } from '../../../components/Form/ProfileForm';
import { IUserDetails } from '../../../types';

export const isOffChainDataUpdated = (
  updateValues: IUpdateProfileFormValues,
  offChainProfileData?: IUserDetails,
): boolean => {
  if (!offChainProfileData) return true;

  const updateKeys = Object.keys(updateValues) as Array<keyof IUpdateProfileFormValues>;

  for (const key of updateKeys) {
    // Check if the field exists in both objects and if it's defined in the update values
    if (updateValues[key] !== undefined && key in offChainProfileData) {
      const updateValue = updateValues[key];
      const existingValue = offChainProfileData[key as keyof IUserDetails];

      console.log('Comparing', key, ':', updateValue, 'vs', existingValue);

      // Comparing values if truthy
      if (!!updateValue && updateValue !== existingValue) {
        console.log('Difference found in', key);
        return true;
      }
    }
  }

  return false;
};
