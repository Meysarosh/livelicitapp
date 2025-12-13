'use client';

import { useState } from 'react';
import Image from 'next/image';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Wrapper = styled.div<{ rounded?: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: ${({ rounded }) => (rounded ? '50%' : 'inherit')};
`;

const Skeleton = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.32) 50%,
    rgba(255, 255, 255, 0.18) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.25s ease-out;
  pointer-events: none;
`;

const StyledImage = styled(Image)<{ $visible: boolean; $contain?: boolean }>`
  object-fit: ${({ $contain }) => ($contain ? 'contain' : 'cover')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.35s ease-in-out;
`;

const NoImageFallback = styled.div`
  font-size: 10px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

type Props = {
  src?: string | null;
  alt: string;
  rounded?: boolean;
  contain?: boolean;
  className?: string;
};

export function ImageWithSkeleton({ src, alt, rounded, contain, className }: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return <NoImageFallback>No image</NoImageFallback>;
  }

  return (
    <Wrapper rounded={rounded} className={className}>
      <Skeleton $visible={!loaded} />

      <StyledImage
        src={src}
        alt={alt}
        fill
        sizes='100%'
        $visible={loaded}
        $contain={contain}
        onLoad={() => setLoaded(true)}
        loading='eager'
      />
    </Wrapper>
  );
}
