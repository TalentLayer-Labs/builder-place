import { useMutation, useQueryClient } from 'react-query';
import { SetBuilderPlaceOwner } from '../types';
import { showMongoErrorTransactionToast } from '../../../utils/toast';

export function useSetBuilderPlaceOwner() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; id: string; error?: string }, Error, SetBuilderPlaceOwner>(
    (updateBuilderPlaceData: SetBuilderPlaceOwner) =>
      fetch('/api/domain/set-builder-place-owner', {
        method: 'PUT',
        body: JSON.stringify(updateBuilderPlaceData),
        headers: {
          'Content-type': 'application/json',
        },
      }).then(res => {
        return res.json();
      }),
    {
      onError: error => {
        throw new Error('Failed to create builderPlace', error);
      },
    },
  );
}
