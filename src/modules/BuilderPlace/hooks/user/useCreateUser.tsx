import { toast } from 'react-toastify';
import MultiStepsTransactionToast from '../../../../components/onboarding/user/MultiStepsTransactionToast';
import axios, { AxiosResponse } from 'axios';
import { useContext } from 'react';
import { useMutation } from 'react-query';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import {
  ICreateUser,
  ICreateUserFormValues,
} from '../../../../components/onboarding/user/CreateUserForm';
import { delegateMintID } from '../../../../components/request';
import TalentLayerContext from '../../../../context/talentLayer';
import useMintFee from '../../../../hooks/useMintFee';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import UserContext from '../../context/UserContext';
import { createVerificationEmailToast } from '../../utils/toast';
import { wait } from '../../../../utils/toast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';

const useCreateUser = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useContext(UserContext);
  const { user: talentLayerUser } = useContext(TalentLayerContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { calculateMintFee } = useMintFee();
  const talentLayerClient = useTalentLayerClient();
  const userMutation = useMutation(
    async (body: ICreateUser): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.post('/api/users', body);
    },
  );

  const createNewUser = async (values: ICreateUserFormValues) => {
    if (!walletClient || !talentLayerClient || !address) {
      throw new Error('Please connect your wallet');
    }

    /**
     * @dev Create a multistep toast to inform the user about the process
     */
    const toastId = toast(<MultiStepsTransactionToast currentStep={1} />, {
      autoClose: false,
      closeOnClick: false,
    });

    await wait(2);

    let userId = talentLayerUser?.id;

    try {
      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      /**
       * @dev Now we can mint the TalentLayerID. Better to do a new query here to make it not blocking potentially.
       * @note: it would block the process if we have to wait for tx confirmation to get the new TLID, so we continue the process.
       */
      if (!talentLayerUser) {
        toast.update(toastId, {
          render: <MultiStepsTransactionToast currentStep={2} />,
        });

        if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE_MINT === 'true') {
          const handlePrice = calculateMintFee(values.talentLayerHandle);
          const tx = await delegateMintID(
            chainId,
            values.talentLayerHandle,
            String(handlePrice),
            address,
            builderPlace?.talentLayerPlatformId || (process.env.NEXT_PUBLIC_PLATFORM_ID as string),
            signature,
            process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE_ON_MINT === 'true',
          );

          userId = tx.data.userId;
        } else {
          if (talentLayerClient) {
            //TODO: invalid Bigint syntax :/
            console.log('ic !', values.talentLayerHandle);
            const txHash = await talentLayerClient.profile.create(values.talentLayerHandle);
            console.log('ic !', txHash);
            await publicClient.waitForTransactionReceipt({
              confirmations: 1,
              hash: txHash,
            });
            //@dev Return value as native browser bigint
            const id = await publicClient.readContract({
              address: talentLayerClient.getChainConfig(chainId).contracts.talentLayerId.address,
              abi: talentLayerClient.getChainConfig(chainId).contracts.talentLayerId.abi,
              functionName: 'ids',
              args: [walletClient.account.address],
            });
            userId = id as unknown as string;
          }
        }
      }

      toast.update(toastId, {
        render: <MultiStepsTransactionToast currentStep={3} />,
      });

      /**
       * @dev Post a new user to DB. Everytime we need to create or update an entity, we need to confirm with the signature
       */
      await userMutation.mutateAsync({
        data: {
          name: values.name,
          talentLayerHandle: values.talentLayerHandle,
          talentLayerId: String(userId),
          email: values.email,
          picture: values.picture || undefined,
          address: address,
        },
        signature: signature,
        address: address,
        domain: window.location.hostname + ':' + window.location.port,
      });

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        render: 'Congrats! Your profile is fully ready',
        autoClose: 5000,
        closeOnClick: true,
      });

      /**
       * @dev Success, we can redirect to the next step and alter the user for Email and Minting
       */
      await createVerificationEmailToast();
    } catch (error: any) {
      toast.dismiss(toastId);
      console.log('CATCH error', error);

      throw error;
    }
  };

  return { createNewUser };
};

export default useCreateUser;
