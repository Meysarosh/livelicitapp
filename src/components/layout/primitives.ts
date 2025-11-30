'use client';

import styled from 'styled-components';

export const FormSection = styled.section`
  min-height: calc(100vh - 120px); /* header (60) + footer (60) */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)} 0;
`;

export const PageSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Container = styled.div<{ maxwidth?: 'sm' | 'md' | 'lg' }>`
  width: 100%;
  max-width: ${({ maxwidth }) => {
    switch (maxwidth) {
      case 'sm':
        return '420px';
      case 'md':
        return '720px';
      default:
        return '1120px';
    }
  }};
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;
