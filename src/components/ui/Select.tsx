import React from 'react';
import styled from 'styled-components';
import { useFormField } from '../forms/FormFiieldWrapper';

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
