'use client';
import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function SWRProvider({ children }: Props) {
  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      dedupingInterval: 3000,
      keepPreviousData: true,
      shouldRetryOnError: (err) => false,
    }}>
      {children}
    </SWRConfig>
  );
}

