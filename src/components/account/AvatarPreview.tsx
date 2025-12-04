import styled from 'styled-components';
import Image from 'next/image';
import { Muted } from '../ui';

const AvatarImage = styled(Image)`
  object-fit: cover;
`;

const AvatarImageContainer = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  background-color: ${(props) => props.theme.colors.footerBg};
  border-radius: 50%;
  border: 1px solid #ddd;
  overflow: hidden;
`;

export function AvatarPreview({ src, alt }: { src: string | null; alt: string }) {
  return (
    <AvatarImageContainer>
      {src ? <AvatarImage src={src} alt={alt} width={96} height={96} /> : <Muted>No avatar</Muted>}
    </AvatarImageContainer>
  );
}
