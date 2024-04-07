import { User } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import {
  ICreatePlatform,
  ICreatePlatformFormValues,
} from '../../../../components/onboarding/platform/CreatePlatformForm';
import MultiStepsTransactionToast from '../../../../components/onboarding/platform/MultiStepsTransactionToast';
import { delegatePlatformMint } from '../../../../components/request';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { IPlatform } from '../../../../types';
import { themes } from '../../../../utils/themes';

const useCreatePlatform = () => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useAccount();
  const talentLayerClient = useTalentLayerClient();
  const platformMutation = useMutation(
    async (body: ICreatePlatform): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.post('/api/platforms', body);
    },
  );

  const createNewPlatform = async (
    values: ICreatePlatformFormValues,
    user: User,
    existingPlatform?: IPlatform,
  ) => {
    if (!walletClient || !address) {
      throw new Error('Please connect your wallet');
    }

    /**
     * @dev Create a multistep toast to inform the user about the process
     */
    const toastId = toast(<MultiStepsTransactionToast currentStep={1} />, {
      autoClose: false,
      closeOnClick: false,
    });

    let platformId = existingPlatform?.id;

    try {
      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      if (!existingPlatform && publicClient && talentLayerClient) {
        toast.update(toastId, {
          render: <MultiStepsTransactionToast currentStep={2} />,
        });
        if (process.env.NEXT_PUBLIC_ACTIVATE_DELEGATE_MINT === 'true') {
          const tx = await delegatePlatformMint(
            values.talentLayerPlatformName,
            address,
            user.talentLayerId,
            chainId,
            signature,
          );

          platformId = tx.data.platformId;
        } else {
          if (talentLayerClient) {
            const txHash = await talentLayerClient.platform.mint(values.talentLayerPlatformName);
            await talentLayerClient.viemClient.publicClient.waitForTransactionReceipt({
              hash: txHash,
            });
            await publicClient.waitForTransactionReceipt({
              confirmations: 1,
              hash: txHash,
            });
            const id = await publicClient.readContract({
              address:
                talentLayerClient.getChainConfig(chainId).contracts.talentLayerPlatformId.address,
              abi: talentLayerClient.getChainConfig(chainId).contracts.talentLayerPlatformId.abi,
              functionName: 'ids',
              args: [walletClient.account.address],
            });
            platformId = id as unknown as string;
          }
        }
      }

      toast.update(toastId, {
        render: <MultiStepsTransactionToast currentStep={3} />,
      });

      /**
       * @dev Post a new platform to DB. Everytime we need to create or update an entity, we need to confirm with the signature
       */
      const subdomain = `${values.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
      await platformMutation.mutateAsync({
        data: {
          name: values.name,
          subdomain: subdomain,
          talentLayerPlatformName: values.talentLayerPlatformName,
          talentLayerPlatformId: String(platformId),
          logo: values.logo,
          palette: themes['lisboa'],
          ownerId: user.id,
        },
        signature: signature,
        address: address,
        domain: `${window.location.hostname}${
          window.location.port ? ':' + window.location.port : ''
        }`,
      });

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        render: 'Congrats! Your platform is fully ready',
        autoClose: 5000,
        closeOnClick: true,
      });
    } catch (error: any) {
      toast.dismiss(toastId);
      console.log('CATCH error', error);

      throw error;
    }
  };

  return { createNewPlatform };
};

export default useCreatePlatform;
