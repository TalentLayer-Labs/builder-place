import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { useMutation } from 'react-query';
import axios, { AxiosResponse } from 'axios';
import { getConfig } from '../../../../config';
import useGetPlatformBy from './useGetPlatformBy';
import { ITransferPlatformOwnership } from '../../../../pages/[domain]/admin/PlatformTransferForm';
import TalentLayerPlatformId from '../../../../contracts/ABI/TalentLayerPlatformID.json';
import { createMultiStepsTransactionToast } from '../../../../utils/toast';
import { toast } from 'react-toastify';

const useTransferPlatform = () => {
  const chainId = useChainId();
  const config = getConfig(chainId);
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const { platform } = useGetPlatformBy({ ownerAddress: address });
  const platformMutation = useMutation(
    async (body: ITransferPlatformOwnership): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.put(`/api/platforms/transfer-owner/${platform?.id}`, body);
    },
  );

  const transferPlatform = async (toUserAddress: string, toUserOwnerId: number) => {
    if (!walletClient || !address) {
      return;
    }

    //  @ts-ignore
    const transaction = await walletClient.writeContract({
      address: config.contracts.talentLayerPlatformId,
      abi: TalentLayerPlatformId.abi,
      functionName: 'transferFrom',
      args: [address, toUserAddress, platform?.id],
    });

    await createMultiStepsTransactionToast(
      chainId,
      {
        pending: 'Updating informations ...',
        success: 'Congrats! Your informations has been updated',
        error: 'An error occurred while updating your informations',
      },
      publicClient,
      transaction,
      'platform',
    );

    /**
     * @dev Sign message to prove ownership of the address
     */
    const signature = await walletClient.signMessage({
      account: address,
      message: `connect with ${address}`,
    });

    await platformMutation.mutateAsync({
      data: {
        ownerId: toUserOwnerId,
      },
      signature: signature,
      address: address,
      domain: `${window.location.hostname}${
        window.location.port ? ':' + window.location.port : ''
      }`,
    });

    toast.success('Congrats! Your platform was successfully transferred');
  };

  return { transferPlatform };
};

export default useTransferPlatform;
