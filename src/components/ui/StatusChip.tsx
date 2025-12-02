'use client';

import styled, { css } from 'styled-components';

export type StatusTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

export const StatusChip = styled.span<{ $tone?: StatusTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing(1)};
  min-height: 20px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.typography.spanSize};
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;

  ${({ theme, $tone = 'default' }) => {
    switch ($tone) {
      case 'success':
        return css`
          background-color: ${theme.colors.successSoft};
          color: ${theme.colors.successStrong};
        `;
      case 'warning':
        return css`
          background-color: ${theme.colors.warningSoft};
          color: ${theme.colors.warningStrong};
        `;
      case 'danger':
        return css`
          background-color: ${theme.colors.dangerSoft};
          color: ${theme.colors.dangerStrong};
        `;
      case 'info':
        return css`
          background-color: ${theme.colors.accentSoft};
          color: ${theme.colors.accent};
        `;
      case 'default':
      default:
        return css`
          background-color: ${theme.colors.bgElevated};
          color: ${theme.colors.textMuted};
        `;
    }
  }}
`;
