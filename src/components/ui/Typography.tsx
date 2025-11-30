'use client';

import styled from 'styled-components';

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.h1Size};
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
  color: ${({ theme }) => theme.colors.text};
`;

export const SubTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.h2Size};
  font-weight: 600;
  line-height: 1.35;
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  color: ${({ theme }) => theme.colors.text};
`;

export const Paragraph = styled.p`
  margin: ${({ theme }) => theme.spacing(1)} 0;
  font-size: ${({ theme }) => theme.typography.pSize};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Muted / secondary text (e.g. hints, meta info)
 */
export const Muted = styled.p`
  margin: ${({ theme }) => theme.spacing(1)} 0;
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
`;

/**
 * Small caption under controls or cards
 */
export const Caption = styled.span`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  font-size: ${({ theme }) => theme.typography.spanSize};
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Note = styled.p`
  margin: ${({ theme }) => theme.spacing(1)} 0;
  font-size: ${({ theme }) => theme.typography.smallSize};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ErrorText = styled.p.attrs({
  role: 'alert',
  'aria-live': 'polite',
})`
  margin: ${({ theme }) => theme.spacing(1)} 0 0 0;
  font-size: ${({ theme }) => theme.typography.smallSize};
  color: ${({ theme }) => theme.colors.danger};
  font-weight: 500;
`;

export const LinkText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

export const MonospaceText = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: ${({ theme }) => theme.typography.smallSize};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
`;
