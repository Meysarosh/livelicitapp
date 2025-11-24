'use client';
import styled from 'styled-components';

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
`;

export const Badge = styled.span<{ $tone?: 'success' | 'danger' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: ${({ $tone }) => ($tone === 'success' ? '#ecfdf3' : $tone === 'danger' ? '#fef2f2' : '#e5e7eb')};
  color: ${({ $tone }) => ($tone === 'success' ? '#166534' : $tone === 'danger' ? '#b91c1c' : '#374151')};
`;
