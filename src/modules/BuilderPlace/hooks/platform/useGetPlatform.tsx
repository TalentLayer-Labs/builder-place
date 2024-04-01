import { useEffect, useState } from 'react';
import { getPlatformBy } from '../../request';
import { BuilderPlace } from '@prisma/client';

const useGetPlatformByOwnerId = (
  ownerId?: number,
): { platform: BuilderPlace | null; loading: boolean } => {
  const [platform, setPlatform] = useState<BuilderPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const getPlatformById = async (id?: number) => {
    setLoading(true);
    try {
      if (!id) return;
      const response = await getPlatformBy({ ownerId: id });
      setPlatform(response);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPlatformById(ownerId);
  }, [ownerId]);

  return { platform, loading };
};

export default useGetPlatformByOwnerId;
