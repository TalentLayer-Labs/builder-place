import { IEmailPreferences } from '../../types';
import { User } from '@prisma/client';
import { UsersFilters } from '../../app/api/users/route';
import axios from 'axios';

export const upload = async (file: File, fileName?: string): Promise<any> => {
  console.log(file);
  try {
    let formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`/api/domain/upload${fileName ? `?fileName=${fileName}` : ''}`, {
      method: 'POST',
      body: formData,
    });
    return (await response.json()).image;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getUserBy = async (filters: UsersFilters): Promise<User> => {
  console.log(`*DEBUG* getUserBy fetch!`);

  const response = await axios.get('/api/users', {
    params: filters,
  });

  const users: User[] = response.data.users;

  console.log(`*DEBUG* getUserBy results!`, users);
  return users[0];
};

export const getUsersNotificationData = async (
  builderPlaceId: string,
  ownerId: string,
  emailNotificationType: keyof IEmailPreferences,
  address: `0x${string}`,
  signature: `0x${string}` | Uint8Array,
): Promise<any> => {
  try {
    const response = await fetch('/api/domain/get-verified-users-email-notification-data', {
      method: 'POST',
      body: JSON.stringify({
        builderPlaceId,
        ownerId,
        emailNotificationType,
        address,
        signature,
      }),
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
