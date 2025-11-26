import React from 'react';
import styled from 'styled-components';
import { useFormField } from '../forms/FormFiieldWrapper';

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

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>((props, ref) => {
  const { id: contextId, hasError, errorId, labelId } = useFormField();

  const id = props.id ?? contextId;
  const isInvalid = props['aria-invalid'] ?? hasError;

  const describedBy =
    [props['aria-describedby'], hasError ? errorId : undefined].filter(Boolean).join(' ') || undefined;

  const labelledBy = [props['aria-labelledby'], labelId].filter(Boolean).join(' ') || undefined;

  return (
    <SCTextArea
      ref={ref}
      id={id}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      aria-labelledby={labelledBy}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';
