'use client';

import styled from 'styled-components';
import React, { useId } from 'react';
import { ErrorText } from './Typography';
import { RequiredMark } from '@/components/forms/form.styles';

const SCSelect = styled.select`
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
`;

const SCLabel = styled.label`
  font-size: 14px;
  display: inline-flex;
  align-items: baseline;
`;

type SelectOption = { value: string; label: React.ReactNode };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
  options?: SelectOption[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  const { label, error, options, children, ...rest } = props;
  const autoId = useId();

  const {
    id,
    ['aria-describedby']: ariaDescribedBy,
    ['aria-labelledby']: ariaLabelledByProp,
    ['aria-invalid']: ariaInvalidProp,
    ...selectRest
  } = rest;

  const selectId = id ?? autoId;
  const isRequiredField = Boolean(rest.required);
  const labelId = `${selectId}-label`;
  const errorId = `${selectId}-error`;

  const describedByParts = [ariaDescribedBy, error ? errorId : undefined].filter(
    (val): val is string => Boolean(val),
  );
  const mergedAriaDescribedBy = describedByParts.length ? describedByParts.join(' ') : undefined;

  const labelledByParts = [ariaLabelledByProp, label ? labelId : undefined].filter(
    (val): val is string => Boolean(val),
  );
  const mergedAriaLabelledBy = labelledByParts.length ? labelledByParts.join(' ') : undefined;

  const mergedAriaInvalid = typeof ariaInvalidProp !== 'undefined' ? ariaInvalidProp : error ? true : undefined;

  return (
    <>
      {label && (
        <SCLabel id={labelId} htmlFor={selectId}>
          {label}
          {isRequiredField && <RequiredMark aria-hidden='true'>*</RequiredMark>}
        </SCLabel>
      )}
      <SCSelect
        ref={ref}
        id={selectId}
        aria-describedby={mergedAriaDescribedBy}
        aria-labelledby={mergedAriaLabelledBy}
        aria-invalid={mergedAriaInvalid}
        {...selectRest}
      >
        {options
          ? options.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </SCSelect>
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </>
  );
});

Select.displayName = 'Select';
