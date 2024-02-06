import { useMutation, useQueryClient } from 'react-query';
import { UpdateUserNotificationPreferences } from '../types';

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; id: string; error?: string },
    Error,
    UpdateUserNotificationPreferences
  >(
    updateEmail =>
      fetch('/api/domain/update-user-notification-preferences', {
        method: 'PUT',
        body: JSON.stringify(updateEmail),
        headers: {
          'Content-type': 'application/json',
        },
      }).then(res => {
        return res.json();
      }),
    {
      onError: error => {
        throw new Error('Failed to update notification preferences', error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('emailPreferences');
      },
    },
  );
}
