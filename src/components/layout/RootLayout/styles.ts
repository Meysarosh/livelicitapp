'use client';

import styled from 'styled-components';

export const ShellWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(2)};
`;

export const ContentContainer = styled.div`
  max-width: 1120px;
  margin: 0 auto;
`;

export const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.footerBg};
`;

export const FooterInner = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;
