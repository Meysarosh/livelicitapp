'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
`;
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

export const Input = styled.input`
  margin: 4px 0;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
`;
export const Btn = styled.button`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
`;
export const ErrorText = styled.p.attrs({ role: 'alert', 'aria-live': 'polite' })`
  margin: 0;
  color: #b00020;
  font-size: 13px;
`;
export const Note = styled.p`
  font-size: 13px;
  opacity: 0.8;
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
export const SummaryTitle = styled.h2`
  margin: 0 0 6px;
  font-size: 16px;
`;
export const SummaryList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
`;
export const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 120px;
`;
