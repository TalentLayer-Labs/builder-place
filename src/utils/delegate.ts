import { TalentLayerClient } from '@talentlayer/client';

export function initializeTalentLayerClient(platformID?: string) {
    const delegateSeedPhrase = process.env.NEXT_PRIVATE_DELEGATE_SEED_PHRASE;
    const rpcUrl = process.env.NEXT_PUBLIC_YOUR_RPC_URL as string;
    const platformId = platformID || process.env.NEXT_PUBLIC_PLATFORM_ID as string;

    const talentLayerClient = new TalentLayerClient({
        chainId: process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID as unknown as number,
        ipfsConfig: {
            clientSecret: process.env.NEXT_PUBLIC_IPFS_SECRET as string,
            baseUrl: process.env.NEXT_PUBLIC_IPFS_WRITE_URL as string,
        },
        platformId: parseInt(platformId),
        walletConfig: {
            rpcUrl: rpcUrl,
            mnemonic: delegateSeedPhrase,
        },
    });

    return talentLayerClient;
}
