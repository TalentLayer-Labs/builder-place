import { useEffect, useState } from 'react';
import { IPlatform } from '../types';
import useTalentLayerClient from './useTalentLayerClient';

const usePlatformByOwner = (address?: `0x${string}`): IPlatform | undefined => {
  const [platforms, setAddresses] = useState<IPlatform | undefined>();
  const talentLayerClient = useTalentLayerClient();

  useEffect(() => {
    const fetchData = async () => {
      if (address) {
        try {
          const response = await talentLayerClient?.platform.getByOwner(address);
          //TODO .length check ?
          setAddresses(response[0]);
        } catch (error: any) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    };
    fetchData();
  }, [address]);

  return platforms;
};

export default usePlatformByOwner;
