import { useCallback } from 'react';
import useTalentLayerClient from '../../../../hooks/useTalentLayerClient';

export function useCheckAvailability() {
  const talentLayerClient = useTalentLayerClient();

  return useCallback(
    async (entityName: string, initialValue: string, entityType: 'platform' | 'handle') => {
      if (entityName.length >= 5 && entityName !== initialValue) {
        const queryType = entityType === 'platform' ? 'platforms' : 'users';
        const fieldName = entityType === 'platform' ? 'name' : 'handle';

        const data = await talentLayerClient?.graphQlClient.get(`
        {
          ${queryType}(where: {${fieldName}: "${entityName}"}, first: 1) {
            id
          }
        }
      `);

        return data && data.data[queryType].length !== 0;
      }
      return false;
    },
    [talentLayerClient],
  );
}
