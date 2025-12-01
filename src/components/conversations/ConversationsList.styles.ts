import styled from 'styled-components';
import Link from 'next/link';

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Item = styled.li`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const ItemLink = styled(Link)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  text-decoration: none;
  color: inherit;
`;

export const ThumbWrapper = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  flex-shrink: 0;
`;

export const Content = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AuctionTitle = styled.span`
  font-weight: 500;
  font-size: ${({ theme }) => theme.typography.pSize};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Badge = styled.span`
  font-size: ${({ theme }) => theme.typography.smallSize};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 2px 8px;
`;

export const LastLine = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: baseline;
`;
