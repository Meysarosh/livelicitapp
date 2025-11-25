'use client';

import styled from 'styled-components';

export const SCbutton = styled.button`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  transition: background 0.15s;
  &:hover {
    background: #f8fafc;
  }
`;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <SCbutton {...props}>{children}</SCbutton>;
};
