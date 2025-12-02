import styled from 'styled-components';

export const MessagesBox = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bgElevated};
  padding: ${({ theme }) => theme.spacing(2)};
  max-height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

export const MessageRow = styled.div<{ $own: boolean }>`
  align-self: ${({ $own }) => ($own ? 'flex-end' : 'flex-start')};
  max-width: 80%;
`;

export const Bubble = styled.div<{ $own: boolean }>`
  padding: ${({ theme }) => theme.spacing(1.25)} ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $own, theme }) => ($own ? theme.colors.primary : theme.colors.accent)};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.pSize};
`;

export const MetaLine = styled.div`
  margin-top: 2px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.smallSize};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: right;
`;
