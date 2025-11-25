'use client';

import styled from 'styled-components';

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
`;

export const SubTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
`;

export const Note = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #374151;
  opacity: 0.8;
`;

export const ErrorText = styled.p.attrs({ role: 'alert', 'aria-live': 'polite' })`
  margin: 0;
  color: #b00020;
  font-size: 13px;
`;
