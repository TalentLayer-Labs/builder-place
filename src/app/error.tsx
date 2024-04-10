'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Error500 from '../components/Error500';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.log('GLOOOOOOOOOOBBBBBBBBBBBAAAAAAAAAALLLLLLL');
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return <Error500 />;
}
