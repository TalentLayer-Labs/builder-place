import { useAccount, useSwitchChain } from 'wagmi';

function NetworkLink({ chaindId, chainName }: { chaindId: number; chainName: string }) {
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();

  if (!switchChain) {
    return null;
  }

  return (
    <a
      onClick={() => {
        switchChain({
          chainId: chaindId,
        });
      }}
      className={`cursor-pointer text-base-content block px-4 py-2 text-sm' ${
        chain?.id === chaindId ? 'bg-base-200 ' : 'hover:opacity-80'
      }`}>
      {chainName}
    </a>
  );
}

export default NetworkLink;
