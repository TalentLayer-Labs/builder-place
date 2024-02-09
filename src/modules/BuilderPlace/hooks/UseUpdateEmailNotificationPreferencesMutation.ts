import { useMutation, useQueryClient } from 'react-query';
import { UpdateUserEmailPreferences } from '../types';

export function useUpdateEmailNotificationPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; id: string; error?: string },
    Error,
    UpdateUserEmailPreferences
  >(
    updateNotificationPreferences =>
      fetch('/api/domain/update-user-notification-preferences', {
        method: 'PUT',
        body: JSON.stringify(updateNotificationPreferences),
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
