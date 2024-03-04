import axios, { AxiosResponse } from 'axios';
import { useCallback, useContext } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useChainId, useWalletClient } from 'wagmi';
import {
  ICreatePlatform,
  ICreatePlatformFormValues,
} from '../../../../components/onboarding/platform/CreatePlatformForm';
import MultiStepsTransactionToast from '../../../../components/onboarding/platform/MultiStepsTransactionToast';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { IPlatform } from '../../../../types';
import { themes } from '../../../../utils/themes';
import { wait } from '../../../../utils/toast';
import UserContext from '../../context/UserContext';

const useCreatePlatform = (existingPlatform: IPlatform | null) => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useContext(UserContext);
  const talentLayerClient = useTalentLayerClient();
  const platformMutation = useMutation(
    async (body: ICreatePlatform): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.post('/api/platforms', body);
    },
  );

  const createNewPlatform = useCallback(
    async (values: ICreatePlatformFormValues) => {
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

      await wait(2);

      try {
        /**
         * @dev Sign message to prove ownership of the address
         */
        const signature = await walletClient.signMessage({
          account: address,
          message: `connect with ${address}`,
        });

        toast.update(toastId, {
          render: <MultiStepsTransactionToast currentStep={2} />,
        });

        if (!existingPlatform && talentLayerClient) {
          const tx = await talentLayerClient.platform.mint(values.talentLayerPlatformName);
          await talentLayerClient.viemClient.publicClient.waitForTransactionReceipt({ hash: tx });
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
            logo: values.logo,
            palette: themes['lisboa'],
          },
          signature: signature,
          address: address,
          domain: window.location.hostname + ':' + window.location.port,
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
    },
    [existingPlatform],
  );

  return { createNewPlatform };
};

export default useCreatePlatform;
