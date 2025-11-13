/**
 * Custom Image component that forces unoptimized mode
 * This ensures images from Supabase and external sources work correctly on Vercel
 */
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface UnoptimizedImageProps extends Omit<ImageProps, 'unoptimized'> {
  unoptimized?: boolean; // Keep for explicit control, but always true
}

export default function UnoptimizedImage(props: UnoptimizedImageProps) {
  return <Image {...props} unoptimized={true} />;
}



