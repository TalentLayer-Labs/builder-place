import { useMutation, useQueryClient } from 'react-query';

export function useDeleteSpaceMutation() {
  const queryClient = useQueryClient();

  return useMutation(
    (subDomain: string): Promise<any> =>
      fetch(`/api/domain/delete-space/?subDomain=${subDomain}`, {
        method: 'DELETE',
      }).then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          throw new Error('Failed to delete space');
        }
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('createSpaces');
      },
    },
  );
}
