'use client';

import styled from 'styled-components';

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const ToolbarGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};
  align-items: center;
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  color: ${({ theme }) => theme.colors.text};
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: auto;
`;

export const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  color: ${({ theme }) => theme.colors.text};
`;
