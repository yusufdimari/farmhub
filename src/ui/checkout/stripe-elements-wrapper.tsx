'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode, useEffect, useState } from 'react';

const publishableKey = 'pk_test_51R4TYx2NX5KAvJfdIerQFsMVXcuL8lObfQ5DStHV1MJKEdWJlvoFSGXnSXXQ0tu0bl2LgXQBc1c68fvsQBczdFyN00MQh9KmHY'
const stripePromise = loadStripe(publishableKey);

export function StripeElementsWrapper({
  clientSecret,
  locale,
  children,
}: {
  clientSecret: string;
  locale: string;
  children: ReactNode;
}) {
  const [options, setOptions] = useState<any>(null);

  useEffect(() => {
    if (clientSecret) {
      setOptions({
        clientSecret,
        locale,
      });
    }
  }, [clientSecret, locale]);

  if (!options) return null;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
