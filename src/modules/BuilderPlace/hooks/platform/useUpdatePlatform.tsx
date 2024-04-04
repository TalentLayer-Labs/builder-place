import axios, { AxiosResponse } from 'axios';
import { useContext } from 'react';
import { useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import {
  IConfigurePlace,
  IConfigurePlaceFormValues,
} from '../../../../components/ConfigurePlatform/ConfigurePlatformForm';
import TwoStepsTransactionToast, {
  IMessages,
} from '../../../../components/TwoStepsTransactionToast';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';

const useUpdatePlatform = () => {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useAccount();
  const { builderPlace } = useContext(BuilderPlaceContext);
  const platformMutation = useMutation(
    async (body: IConfigurePlace): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.put(`/api/platforms/${builderPlace?.id}`, body);
    },
  );

  const updatePlatform = async (values: IConfigurePlaceFormValues) => {
    if (!walletClient || !address) {
      throw new Error('Please connect your wallet');
    }

    /**
     * @dev Create a multistep toast to inform the user about the process
     */
    const messages: IMessages = {
      step1: 'Sign a message to authenticate with your wallet',
      step2: 'Update your platform',
    };
    const toastId = toast(<TwoStepsTransactionToast currentStep={1} messages={messages} />, {
      autoClose: false,
      closeOnClick: false,
    });

    try {
      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: `connect with ${address}`,
      });

      toast.update(toastId, {
        render: <TwoStepsTransactionToast currentStep={2} messages={messages} />,
      });

      /**
       * @dev Update the platform in DB. Everytime we need to create or update an entity, we need to confirm with the signature
       */
      const subdomain = `${values.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
      await platformMutation.mutateAsync({
        data: {
          subdomain: subdomain,
          palette: values.palette,
          logo: values.logo,
          name: values.name,
          baseline: values.baseline,
          about: values.about,
          aboutTech: values.aboutTech,
          icon: values.icon,
          cover: values.cover,
          jobPostingConditions: values.jobPostingConditions,
        },
        signature: signature,
        address: address,
        domain: `${window.location.hostname}${
          window.location.port ? ':' + window.location.port : ''
        }`,
      });

      toast.update(toastId, {
        type: toast.TYPE.SUCCESS,
        render: 'Congrats! Your platform was successfully updated',
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
