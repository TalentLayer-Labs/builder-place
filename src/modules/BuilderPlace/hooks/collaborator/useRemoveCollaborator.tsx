import axios, { AxiosResponse } from 'axios';
import { useContext } from 'react';
import { useMutation } from 'react-query';
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi';
import { toggleDelegation } from '../../../../contracts/toggleDelegation';
import { useConfig } from '../../../../hooks/useConfig';
import { IRemoveBuilderPlaceCollaborator } from '../../../../pages/[domain]/admin/collaborator-card';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';

const useRemoveCollaborator = () => {
  const chainId = useChainId();
  const config = useConfig();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { address } = useAccount();
  const collaboratorMutation = useMutation(
    async ({
      collaboratorId,
      body,
    }: {
      collaboratorId: string;
      body: IRemoveBuilderPlaceCollaborator;
    }): Promise<AxiosResponse<{ id: string }>> => {
      return await axios.put(`/api/collaborators/${collaboratorId}`, body);
    },
  );

  const removeCollaborator = async (
    collaboratorAddress: `0x${string}`,
    delegates: string[] | undefined,
    collaboratorId: string,
    userId: string,
  ): Promise<void> => {
    if (!walletClient || !address || !builderPlace) {
      throw new Error('Please connect your wallet first');
    }

    //TODO: ajouter le toast ? (2 opérations: onchain et DB)
    if (delegates?.includes(collaboratorAddress.toLowerCase())) {
      /**
       * @dev Remove the new collaborator as a delegate to the BuilderPlace owner
       */
      const response = await toggleDelegation(
        chainId,
        userId,
        config,
        collaboratorAddress,
        // @ts-ignore: error after viem v2 migration
        publicClient,
        walletClient,
        false,
      );

      if (response?.error) return;
    }

    /**
     * @dev Sign message to prove ownership of the address
     */
    const signature = await walletClient.signMessage({
      account: address,
      message: `connect with ${address}`,
    });

    console.log('collaboratorId', collaboratorId);

    /**
     * @dev Remove new collaborator from the BuilderPlace
     */
    await collaboratorMutation.mutateAsync({
      collaboratorId: collaboratorId,
      body: {
        data: {
          collaboratorAddress: collaboratorAddress,
          builderPlaceId: builderPlace.id,
          ownerTalentLayerId: userId,
        },
        signature: signature,
        address: address,
        domain: `${window.location.hostname}${
          window.location.port ? ':' + window.location.port : ''
        }`,
      },
    });
  };
  return { removeCollaborator };
};

export default useRemoveCollaborator;
