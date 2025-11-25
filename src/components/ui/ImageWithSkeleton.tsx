'use client';

import { useState } from 'react';
import Image from 'next/image';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Skeleton = styled.div<{ rounded?: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: ${({ rounded }) => (rounded ? '50%' : 'inherit')};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.4) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
`;

const FadeIn = styled.div<{ $visible: boolean }>`
  position: relative;
  height: 100%;
  width: 100%;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.35s ease-in-out;
`;

type Props = {
  src?: string | null;
  alt: string;
  rounded?: boolean; // for avatars
  contain?: boolean; // if some images should use object-fit: contain
  className?: string; // allow styling from parent
};

export function ImageWithSkeleton({ src, alt, rounded, contain, className }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div
        style={{
          fontSize: '10px',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        No image
      </div>
    );
  }

  return (
    <>
      {!loaded && <Skeleton rounded={rounded} />}

      <FadeIn $visible={loaded} className={className}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes='100%'
          style={{ objectFit: contain ? 'contain' : 'cover' }}
          onLoad={() => setLoaded(true)}
        />
      </FadeIn>
    </>
  );
}
