import { NextApiRequest, NextApiResponse } from 'next';

export interface LinkedInAuthData {
  code: string;
  state: string;
}

async function getProfile(access_token: string) {
  try {
    const LI_PROFILE_API_ENDPOINT = 'https://api.linkedin.com/v2/me';
    const response = await fetch(LI_PROFILE_API_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error fetching LinkedIn profile: ${error.message}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse incoming data as JSON
      const data: LinkedInAuthData = req.body;

      // Exchange authorization code for access token
      const accessTokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: data.code,
          redirect_uri: process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || '', // Assuming this is your redirect URI
          client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '', // Your LinkedIn client ID
          client_secret: process.env.NEXT_PRIVATE_LINKEDIN_SECRET || '', // Your LinkedIn client secret
        }),
      });

      // Check if access token exchange was successful
      if (!accessTokenResponse.ok) {
        throw new Error('Failed to exchange authorization code for access token');
      }

      // Parse access token response as JSON
      const accessTokenData = await accessTokenResponse.json();

      // Log access token data
      console.log('Access Token Data:', accessTokenData);

      // Get LinkedIn profile using access token
      const profile = await getProfile(accessTokenData.access_token);

      // Log profile data
      console.log('LinkedIn Profile:', profile);

      // Respond with success message
      res.status(200).json({ message: 'LinkedIn profile received successfully', profile });
    } catch (error) {
      // Handle errors
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Respond with method not allowed for non-POST requests
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
