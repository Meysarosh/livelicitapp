'use client';

import React, { createContext, useContext, useId } from 'react';
import { FormField, Label, RequiredMark } from '@/components/forms/form.styles';
import { ErrorText } from '@/components/ui';

type FormFieldContextValue = {
  id: string;
  errorId: string;
  labelId: string;
  hasError: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue>({ id: '', errorId: '', labelId: '', hasError: false });

export function useFormField() {
  const context = useContext(FormFieldContext);
  return context;
}

type FormFieldWrapperProps = {
  label?: React.ReactNode;
  error?: React.ReactNode;
  id?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function FormFieldWrapper({ label, error, id, required, children }: FormFieldWrapperProps) {
  const autoId = useId();
  const internalId = id ?? autoId;
  const labelId = `${internalId}-label`;
  const errorId = `${internalId}-error`;

  return (
    <FormFieldContext.Provider
      value={{
        id: internalId,
        errorId,
        labelId,
        hasError: !!error,
      }}
    >
      <FormField>
        {label && (
          <Label id={labelId} htmlFor={internalId}>
            {label}
            {required && <RequiredMark aria-hidden='true'>*</RequiredMark>}
          </Label>
        )}

        {children}

        {error && <ErrorText id={errorId}>{error}</ErrorText>}
      </FormField>
    </FormFieldContext.Provider>
  );
}
