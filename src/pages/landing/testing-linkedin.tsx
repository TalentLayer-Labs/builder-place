import Image from 'next/image';
import { useEffect, useState } from 'react';
import { IntroducationSecion } from '../../components/introduction-section';
import Link from 'next/link';
import { useRouter } from 'next/router';

function TestingLinkedin() {
  const router = useRouter();

  useEffect(() => {
    const getParams = () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      if (code && state) {
        fetch('/api/linkedin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
          }),
        })
          .then(response => {
            if (response.ok) {
              // Handle successful response
              console.log('Authorization successful');
            } else {
              // Handle error response
              console.error('Authorization failed');
            }
          })
          .catch(error => {
            // Handle network error
            console.error('Error:', error);
          });
      }
    };

    // Call the function to parse parameters
    getParams();
  }, []); // Ensure useEffect runs only once

  const generateAuthorizationUrl = () => {
    const LI_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
    const url = new URL(LI_AUTH_URL);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '');
    url.searchParams.append('redirect_uri', process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || '');
    url.searchParams.append('state', Math.random().toString(36).substring(7).toUpperCase());
    url.searchParams.append('scope', 'profile openid');
    return url.toString();
  };

  return (
    <div className='bg-white text-black'>
      <main>
        <section id='work-process' className='relative lg:pt-[110px]'>
          <div className='container'>
            <div
              className='wow fadeInUp mx-auto mb-5 max-w-[740px] text-center lg:mb-[30px]'
              data-wow-delay='.2s'>
              <div className='flex justify-center gap-4'>
                <a
                  href={generateAuthorizationUrl()}
                  target='_self'
                  className='max-w-[186px] flex-1 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-white font-bold hover:bg-opacity-60'>
                  Sign in with linkedIn
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default TestingLinkedin;
