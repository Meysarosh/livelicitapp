'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const LayoutWrapper = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  padding: 24px 0;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const Sidebar = styled.aside`
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 16px;
`;

export const SidebarTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 12px;
`;

export const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const MenuItem = styled.li`
  margin-bottom: 8px;
`;

export const MenuLink = styled(Link)`
  display: block;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;

  &:hover {
    background: #f3f4f6;
  }
`;

export const Content = styled.main`
  min-width: 0;
`;
