import { useContext } from 'react';
import { useChainId, usePublicClient, useWalletClient } from 'wagmi';
import BuilderPlaceContext from '../../context/BuilderPlaceContext';
import { toggleDelegation } from '../../../../contracts/toggleDelegation';
import { useConfig } from '../../../../hooks/useConfig';
import { useMutation } from 'react-query';
import axios, { AxiosResponse } from 'axios';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { IRemoveBuilderPlaceCollaborator } from '../../../../pages/[domain]/admin/collaborator-card';
import UserContext from '../../context/UserContext';

const useRemoveCollaborator = () => {
  const chainId = useChainId();
  const config = useConfig();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const { open: openConnectModal } = useWeb3Modal();
  const { builderPlace } = useContext(BuilderPlaceContext);
  const { address } = useContext(UserContext);
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
    //TODO: ajouter le toast ? (2 opérations: onchain et DB)
    //TODO: extraire le loader de la mutation et s'en servir pour les boutons
    //TODO: refaire une passe pour la route (check les errors etc)
    //TODO: faire la route pour add collab
    if (walletClient && collaboratorAddress && builderPlace?.id && address) {
      if (delegates?.includes(collaboratorAddress.toLowerCase())) {
        /**
         * @dev Remove the new collaborator as a delegate to the BuilderPlace owner
         */
        const response = await toggleDelegation(
          chainId,
          userId,
          config,
          collaboratorAddress,
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
          domain: window.location.hostname + ':' + window.location.port,
        },
      });
    } else {
      openConnectModal();
    }
  };
  return { removeCollaborator };
};

export default useRemoveCollaborator;
