'use client';

import styled from 'styled-components';

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};
  font-size: ${({ theme }) => theme.typography.smallSize};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Badge = styled.span<{ $tone?: 'success' | 'danger' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  background: ${({ $tone }) =>
    $tone === 'success'
      ? 'rgba(34, 197, 94, 0.12)'
      : $tone === 'danger'
      ? 'rgba(249, 115, 22, 0.12)'
      : 'rgba(148, 163, 184, 0.15)'};

  color: ${({ theme, $tone }) =>
    $tone === 'success' ? theme.colors.accent : $tone === 'danger' ? theme.colors.danger : theme.colors.textMuted};
`;
