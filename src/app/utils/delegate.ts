import { getUserByAddress } from '../../queries/users';
import { mnemonicToAccount } from 'viem/accounts';
import { createPublicClient, createWalletClient, http, PublicClient } from 'viem';
import { getViemFormattedChain } from '../../chains';
import { NetworkEnum } from '../../types';
import { WalletClient } from 'viem';

export async function isPlatformAllowedToDelegate(
  chainId: number,
  userAddress: string,
): Promise<boolean> {
  const user = await getUserByAddress(chainId, userAddress);
  const delegateAddresses: string[] = user.data?.data?.users[0]?.delegates.map((delegate: any) =>
    delegate.toLowerCase(),
  );

  return !(
    !process.env.NEXT_PUBLIC_DELEGATE_ADDRESS ||
    (process.env.NEXT_PUBLIC_DELEGATE_ADDRESS &&
      delegateAddresses.indexOf(process.env.NEXT_PUBLIC_DELEGATE_ADDRESS?.toLowerCase()) === -1)
  );
}

export async function getDelegationSigner(): Promise<WalletClient | null> {
  const delegateSeedPhrase = process.env.NEXT_PRIVATE_DELEGATE_SEED_PHRASE;

  if (delegateSeedPhrase) {
    const account = mnemonicToAccount(delegateSeedPhrase);
    return createWalletClient({
      account,
      chain: getViemFormattedChain(
        process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as NetworkEnum,
      ),
      transport: http(),
    });
  } else {
    return null;
  }
}

export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: getViemFormattedChain(
      process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as NetworkEnum,
    ),
    transport: http(),
  });
}
