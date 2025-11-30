'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { SubTitle } from '@/components/ui';

export const LayoutWrapper = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)} 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Sidebar = styled.aside`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const SidebarTitle = styled(SubTitle)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SidebarUserInfo = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(2.5)} 0;
  font-size: ${({ theme }) => theme.typography.smallSize};
  color: ${({ theme }) => theme.colors.textMuted};

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const MenuItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const MenuLink = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing(1.25)} ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.pSize};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Content = styled.main`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;
