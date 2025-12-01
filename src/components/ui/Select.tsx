'use client';

import React from 'react';
import styled from 'styled-components';
import { useFormField } from '../forms/FormFieldWrapper';

const SCSelect = styled.select`
  margin: ${({ theme }) => theme.spacing(1)} 0;
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(3)};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.inputFocus};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.inputFocus};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

type SelectOptions<T extends string | number = string> = { value: T; label: React.ReactNode };

type SelectProps = {
  options: SelectOptions[];
} & React.ComponentProps<'select'>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const { id: contextId, hasError, labelId, errorId } = useFormField();

  const id = props.id ?? contextId;

  const isInvalid = props['aria-invalid'] ?? hasError;

  const describedBy =
    [props['aria-describedby'], hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  const labelledBy = [props['aria-labelledby'], labelId].filter(Boolean).join(' ') || undefined;

  const options = props.options;

  return (
    <SCSelect
      ref={ref}
      id={id}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      {...props}
    >
      {options
        ? options.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))
        : props.children}
    </SCSelect>
  );
});

Select.displayName = 'Select';
