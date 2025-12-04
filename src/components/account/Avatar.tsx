import styled from 'styled-components';
import Image from 'next/image';
import { Muted } from '../ui';

const AvatarImage = styled(Image)`
  object-fit: cover;
`;

const AvatarImageContainer = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  background-color: ${(props) => props.theme.colors.footerBg};
  border-radius: 50%;
  border: 1px solid #ddd;
  overflow: hidden;
`;

export function Avatar({ src, alt }: { src: string | null; alt: string }) {
  return (
    <AvatarImageContainer>
      {src ? <AvatarImage src={src} alt={alt} width={48} height={48} /> : <Muted>Profile</Muted>}
    </AvatarImageContainer>
  );
}
