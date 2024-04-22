import { useContext } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { createMultiStepsTransactionToast } from '../../../../utils/toast';
import { IUpdateProfileFormValues } from '../../../../components/Form/ProfileForm';
import { delegateUpdateProfileData } from '../../../../components/request';

const useUpdateUser = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { canUseBackendDelegate, user: talentLayerUser } = useContext(TalentLayerContext);
  const talentLayerClient = useTalentLayerClient();

  const updateUser = async (values: IUpdateProfileFormValues) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    try {
      if (talentLayerUser?.id) {
        const profile = {
          title: values.title,
          role: values.role,
          image_url: values.image_url,
          video_url: values.video_url,
          name: values.name,
          about: values.about,
          skills: values.skills,
          web3mailPreferences: talentLayerUser.description?.web3mailPreferences,
        };

        let tx;
        let cid = '';

        if (canUseBackendDelegate) {
          console.log('DELEGATION');

          /**
           * @dev Sign message to prove ownership of the address
           */
          const signature = await walletClient.signMessage({
            account: address,
            message: `connect with ${address}`,
          });

          const response = await delegateUpdateProfileData(
            {
              chainId,
              userAddress: address.toString(),
              profile,
              signature,
            },
            talentLayerUser?.id,
          );
          tx = response.data.transaction;
          
        } else {
          console.log('Update profile', profile, talentLayerUser.id);
          const res = await talentLayerClient?.profile.update(profile, talentLayerUser.id);

          tx = res.tx;
        }

        await createMultiStepsTransactionToast(
          chainId,
          {
            pending: 'Updating profile...',
            success: 'Congrats! Your profile has been updated',
            error: 'An error occurred while updating your profile',
          },
          publicClient,
          tx,
          'user',
          !!cid ? cid : undefined,
        );
      }
    } catch (error: any) {
      console.log('CATCH error', error);

      throw error;
    }
  };

  return { updateUser };
};

export default useUpdateUser;
