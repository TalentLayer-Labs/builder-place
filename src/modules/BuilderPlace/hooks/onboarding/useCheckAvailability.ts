import { useCallback } from 'react';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';

export function useCheckNameAvailability() {
  const talentLayerClient = useTalentLayerClient();

  return useCallback(
    async (value: string, initialValue: string, entity: 'platforms' | 'users') => {
      if (value.length >= 5 && value !== initialValue) {
        const fieldName = entity === 'platforms' ? 'name' : 'handle';

        const data = await talentLayerClient?.graphQlClient.get(`
        {
          ${entity}(where: {${fieldName}: "${value}"}, first: 1) {
            id
          }
        }
      `);

        return data && data.data[entity].length !== 0;
      }
      return false;
    },
    [talentLayerClient],
  );
}
