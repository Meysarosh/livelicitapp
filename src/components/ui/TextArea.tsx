'use client';

import styled from 'styled-components';
import React, { useId } from 'react';
import { ErrorText } from './Typography';
import { RequiredMark } from '@/components/forms/form.styles';

const SCTextArea = styled.textarea`
  margin: 4px 0;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  min-height: 120px;
  resize: vertical;
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

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: React.ReactNode;
  error?: React.ReactNode;
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { label, error, ...rest } = props;
  const autoId = useId();

  const {
    id,
    ['aria-describedby']: ariaDescribedBy,
    ['aria-labelledby']: ariaLabelledByProp,
    ['aria-invalid']: ariaInvalidProp,
    ...textAreaRest
  } = rest;

  const textAreaId = id ?? autoId;
  const isRequiredField = Boolean(rest.required);
  const labelId = `${textAreaId}-label`;
  const errorId = `${textAreaId}-error`;

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
        <SCLabel id={labelId} htmlFor={textAreaId}>
          {label}
          {isRequiredField && <RequiredMark aria-hidden='true'>*</RequiredMark>}
        </SCLabel>
      )}
      <SCTextArea
        ref={ref}
        id={textAreaId}
        aria-describedby={mergedAriaDescribedBy}
        aria-labelledby={mergedAriaLabelledBy}
        aria-invalid={mergedAriaInvalid}
        {...textAreaRest}
      />
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </>
  );
});

TextArea.displayName = 'TextArea';
