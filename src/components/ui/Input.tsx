'use client';

import styled from 'styled-components';
import React from 'react';
import { useFormField } from '@/components/forms/FormFiieldWrapper';

const SCInput = styled.input`
  margin: 4px 0;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-visible {
    outline: none;
    border-color: #737373;
    box-shadow: 0 0 0 1px #848484;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &[aria-invalid='true'] {
    border-color: #b00020;
    background-color: #fff5f5;
  }
`;

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>((props, ref) => {
  const { id: contextId, hasError, errorId, labelId } = useFormField();

  const id = props.id ?? contextId;
  const isInvalid = props['aria-invalid'] ?? hasError;

  const describedBy =
    [props['aria-describedby'], hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  const labelledBy = [props['aria-labelledby'], labelId].filter(Boolean).join(' ') || undefined;

  return (
    <SCInput
      ref={ref}
      id={id}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      {...props}
    />
  );
});

Input.displayName = 'Input';
