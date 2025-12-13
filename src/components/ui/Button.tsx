'use client';

import styled from 'styled-components';
import type { DefaultTheme } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export function getButtonColors(theme: DefaultTheme, variant: ButtonVariant) {
  switch (variant) {
    case 'secondary':
      return {
        bg: theme.colors.secondary,
        border: theme.colors.secondary,
        text: theme.colors.textOnSecondary ?? '#000000',
        hoverBg: theme.colors.secondaryHover ?? theme.colors.secondary,
        hoverBorder: theme.colors.secondaryHover ?? theme.colors.secondary,
      };
    case 'danger':
      return {
        bg: theme.colors.danger,
        border: theme.colors.danger,
        text: theme.colors.textOnDanger ?? '#ffffff',
        hoverBg: theme.colors.dangerHover ?? theme.colors.danger,
        hoverBorder: theme.colors.dangerHover ?? theme.colors.danger,
      };
    case 'primary':
    default:
      return {
        bg: theme.colors.primary,
        border: theme.colors.primary,
        text: theme.colors.textOnPrimary ?? '#ffffff',
        hoverBg: theme.colors.primaryHover ?? theme.colors.primary,
        hoverBorder: theme.colors.primaryHover ?? theme.colors.primary,
      };
  }
}

export const SCButton = styled.button<{ $variant?: ButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.05s ease,
    box-shadow 0.15s ease;

  ${({ theme, $variant = 'primary' }) => {
    const c = getButtonColors(theme, $variant);
    return `
      border: 1px solid ${c.border};
      background: ${c.bg};
      color: ${c.text};
    `;
  }}

  &:hover {
    ${({ theme, $variant = 'primary' }) => {
      const c = getButtonColors(theme, $variant);
      return `
        background: ${c.hoverBg};
        border-color: ${c.hoverBorder};
      `;
    }}
  }

  &:active {
    transform: translateY(1px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { $variant?: ButtonVariant };

export const Button: React.FC<ButtonProps> = ({ children, $variant, ...props }) => {
  return (
    <SCButton $variant={$variant} {...props}>
      {children}
    </SCButton>
  );
};
