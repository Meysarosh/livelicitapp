import styled from 'styled-components';
import Image from 'next/image';
import { Muted } from '../ui';

const AvatarImage = styled(Image)`
  object-fit: cover;
`;

const AvatarImageContainer = styled.div<{ $size: number }>`
  position: relative;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  display: grid;
  place-items: center;
  background-color: ${(props) => props.theme.colors.footerBg};
  border-radius: 50%;
  border: 1px solid #ddd;
  overflow: hidden;
`;

export function Avatar({ src, alt, preview }: { src: string | null; alt: string; preview?: boolean }) {
  const size = preview ? 96 : 48;
  return (
    <AvatarImageContainer $size={size}>
      {src ? <AvatarImage src={src} alt={alt} width={size} height={size} /> : <Muted>Profile</Muted>}
    </AvatarImageContainer>
  );
}
