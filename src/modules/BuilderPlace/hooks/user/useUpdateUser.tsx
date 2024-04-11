import { useContext } from 'react';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import TalentLayerContext from '../../../../context/talentLayer';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { createMultiStepsTransactionToast } from '../../../../utils/toast';
import { IUpdateProfileFormValues } from '../../../../components/Form/ProfileForm';
import { delegateUpdateProfileData } from '../../../../components/request';
import { useMutation } from 'react-query';
import axios, { AxiosResponse } from 'axios';
import { IUpdateProfile } from '../../../../app/api/users/[id]/route';
import { isOffChainDataUpdated } from '../../utils/user';
import UserContext from '../../context/UserContext';
import { toast } from 'react-toastify';

const useUpdateUser = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { canUseBackendDelegate, user: talentLayerUser } = useContext(TalentLayerContext);
  const { user, getUser } = useContext(UserContext);
  const talentLayerClient = useTalentLayerClient();
  const userMutation = useMutation(
    async (body: IUpdateProfile): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.put(`/api/users/${user?.id}`, body);
    },
  );

  const updateUser = async (values: IUpdateProfileFormValues) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    try {
      // Update off-chain data
      if (talentLayerUser?.id && isOffChainDataUpdated(values, talentLayerUser?.description)) {
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

          cid = await talentLayerClient.profile.upload(profile);

          const response = await delegateUpdateProfileData(
            {
              chainId,
              userAddress: address.toString(),
              cid,
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

      // Update database data

      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      await userMutation.mutateAsync({
        data: {
          name: values.name,
          email: values.email,
          about: values.about,
          picture: values.image_url,
          video: values.video_url,
          title: values.title,
          role: values.role,
          workerProfileFields: { skills: values.skills?.split(',').map(skill => skill.trim()) },
        },
        signature: signature,
        address: address,
        domain: `${window.location.hostname}${
          window.location.port ? ':' + window.location.port : ''
        }`,
      });

      getUser();

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.log('CATCH error', error);

      throw error;
    }
  };

  return { updateUser };
};

export default useUpdateUser;
