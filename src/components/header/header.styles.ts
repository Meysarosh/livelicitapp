import styled from 'styled-components';
import Link from 'next/link';

export const Bar = styled.header`
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;
export const Wrap = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
`;
export const Brand = styled.div`
  font-weight: 700;
  font-size: 16px;
`;
export const Right = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Hello = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

export const Nav = styled.nav`
  display: flex;
  gap: 12px;
  a {
    font-size: 14px;
    opacity: 0.9;
  }
`;
