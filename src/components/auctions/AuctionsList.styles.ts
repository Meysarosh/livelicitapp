import styled from 'styled-components';

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Item = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.05s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.bgElevated};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

export const Thumb = styled.div`
  flex: 0 0 112px;
  height: 80px;
  width: 80px;
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Body = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const ItemTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.pSize};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};
  font-size: ${({ theme }) => theme.typography.spanSize};
  opacity: 0.85;
`;

export const MetaPiece = styled.span`
  strong {
    font-weight: 600;
    margin-right: 4px;
  }
`;
