import { useContext, useEffect, useState } from 'react';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import AccessDenied from '../../../../components/AccessDenied';
import DomainConfiguration from '../../../../modules/BuilderPlace/components/DomainConfiguration';
import BuilderPlaceContext from '../../../../modules/BuilderPlace/context/BuilderPlaceContext';
import { useUpdateBuilderPlaceDomain } from '../../../../modules/BuilderPlace/hooks/UseUpdateBuilderPlaceDomain';

export default function CustomDomain() {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const { address } = useAccount();

  const { builderPlace, isBuilderPlaceCollaborator } = useContext(BuilderPlaceContext);
  const [customDomain, setCustomDomain] = useState('');

  useEffect(() => {
    if (builderPlace?.customDomain) {
      setCustomDomain(builderPlace.customDomain);
    }
  }, [builderPlace]);
  //TODO Prisma: test this
  const updateBuilderPlaceDomainMutation = useUpdateBuilderPlaceDomain();

  const handleUpdateDomainClick = async () => {
    if (!walletClient || !address || !builderPlace) return;
    try {
      /**
       * @dev Sign message to prove ownership of the address
       */
      const signature = await walletClient.signMessage({
        account: address,
        message: builderPlace.id.toString(),
      });
      updateBuilderPlaceDomainMutation.mutate({
        id: builderPlace?.id.toString(),
        customDomain: customDomain,
        subdomain: builderPlace?.subdomain!,
        signature: signature,
      });
    } catch (error) {
      console.error('Error updating domain:', error);
    }
  };

  if (!isBuilderPlaceCollaborator) {
    return <AccessDenied />;
  }

  return (
    <div>
      <p>BuilderPlace name: {builderPlace?.name}</p>

      <label htmlFor='custom-domain'>Custom Domain:</label>
      <input
        type='text'
        id='custom-domain'
        value={customDomain}
        onChange={e => setCustomDomain(e.target.value)}
      />
      <button onClick={handleUpdateDomainClick}>Update Domain</button>

      <DomainConfiguration domain={customDomain} />
    </div>
  );
}
