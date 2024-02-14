import axios, { AxiosResponse } from 'axios';
import { useContext } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useChainId, useWalletClient } from 'wagmi';
import MultiStepsTransactionToast from '../../../../components/onboarding/platform/MultiStepsTransactionToast';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';
import { wait } from '../../../../utils/toast';
import UserContext from '../../context/UserContext';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import {
  IConfigurePlace,
  IConfigurePlaceFormValues,
} from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';

const useUpdatePlatform = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useContext(UserContext);
  const { builderPlace } = useContext(BuilderPlaceContext);
  const talentLayerClient = useTalentLayerClient();
  const platformMutation = useMutation(
    async (body: IConfigurePlace): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.put('/api/platforms', body);
    },
  );

  const updatePlatform = async (values: IConfigurePlaceFormValues) => {
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

      if (talentLayerClient) {
        // TODO: mint platform
        // const tx = await talentLayerClient.platform.
      }

      toast.update(toastId, {
        render: <MultiStepsTransactionToast currentStep={3} />,
      });

      /**
       * @dev Post a new platform to DB. Everytime we need to create or update an entity, we need to confirm with the signature
       */
      if (builderPlace?.id) {
        const response = await platformMutation.mutateAsync({
          data: {
            subdomain: values.subdomain,
            palette: values.palette,
            logo: values.logo,
            name: values.name,
            baseline: values.baseline,
            about: values.about,
            aboutTech: values.aboutTech,
            icon: values.icon,
            cover: values.cover,
            jobPostingConditions: values.jobPostingConditions,
            builderPlaceId: builderPlace?.id,
          },
          signature: signature,
          address: address,
          domain: window.location.hostname + ':' + window.location.port,
        });
      }

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

  return { updatePlatform };
};

export default useUpdatePlatform;
