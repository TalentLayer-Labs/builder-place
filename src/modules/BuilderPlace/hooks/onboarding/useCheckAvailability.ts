import { useCallback, useRef } from 'react';

import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';

type Cache = {
  [key: string]: boolean;
};

export function useCheckNameAvailability() {
  const talentLayerClient = useTalentLayerClient();
  const cacheRef = useRef<Cache>({});

  return useCallback(
    async (value: string, initialValue: string, entity: 'platforms' | 'users') => {
      const cacheKey = `${entity}:${value}:${initialValue}`;
      let isAvailable = cacheRef.current[cacheKey];

      if (isAvailable !== undefined) {
        return isAvailable;
      }

      if (value.length >= 5 && value !== initialValue) {
        const fieldName = entity === 'platforms' ? 'name' : 'handle';
        const query = `
        {
          ${entity}(where: {${fieldName}: "${value}"}, first: 1) {
            id
          }
        }`;

        const data = await talentLayerClient?.graphQlClient.get(query);
        isAvailable = data && data.data[entity].length === 0;
      } else {
        isAvailable = false;
      }

      cacheRef.current[cacheKey] = isAvailable;
      return isAvailable;
    },
    [talentLayerClient],
  );
}
