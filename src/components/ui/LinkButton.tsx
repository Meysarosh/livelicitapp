'use client';

import Link from 'next/link';
import styled from 'styled-components';

export const SCLink = styled(Link)`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: background 0.15s;
  &:hover {
    background: #f8fafc;
  }
`;

type LinkProps = React.ComponentProps<typeof Link>;

export const LinkButton: React.FC<LinkProps> = ({ children, ...props }) => {
  return <SCLink {...props}>{children}</SCLink>;
};
