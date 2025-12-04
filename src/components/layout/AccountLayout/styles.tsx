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

export const StyledLink = styled(Link)<{ $active?: boolean }>`
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;

  color: ${({ $active }) => ($active ? '#ffffff' : '#111827')};
  background-color: ${({ $active }) => ($active ? '#2563eb' : 'transparent')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};

  &:hover {
    background-color: ${({ $active }) => ($active ? '#1d4ed8' : '#eff6ff')};
  }
`;

export const ProfileLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 16px;
  font-size: 14px;

  a {
    text-decoration: underline;
  }
`;

export const Content = styled.main`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;
