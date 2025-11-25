'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const Form = styled.form`
  display: grid;
  gap: 14px;
`;
export const FormField = styled.div`
  display: grid;
  /* gap: 6px; */
`;
export const Label = styled.label`
  font-size: 14px;
  display: inline-flex;
  align-items: baseline;
`;
export const RequiredMark = styled.abbr.attrs({ title: 'required' })`
  color: #b00020;
  text-decoration: none;
  font-weight: 700;
  margin-left: 4px; /* as requested */
`;
export const SCLink = styled(Link)`
  text-decoration: underline;
  color: inherit;
`;
export const Summary = styled.div`
  border: 1px solid #b00020;
  background: #fff5f5;
  color: #3d0c0c;
  padding: 12px;
  border-radius: 8px;
`;
export const SummaryList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
`;
