import { useEffect, useState } from 'react';
import { getPlatformBy } from '../../request';
import { BuilderPlace } from '@prisma/client';

const useGetPlatformByOwnerId = (ownerId?: number) => {
  const [platform, setPlatform] = useState<BuilderPlace | null>(null);
  const getPlatformById = async (id?: number) => {
    if (!id) return;
    try {
      const response = await getPlatformBy({ ownerId: id });
      setPlatform(response);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPlatformById(ownerId);
  }, [ownerId]);

  return { platform };
};

export default useGetPlatformByOwnerId;
