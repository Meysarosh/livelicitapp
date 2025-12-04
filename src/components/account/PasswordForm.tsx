'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { changePassword } from '@/app/actions/changePassword';
import type { PasswordFormState } from '@/services/zodValidation-service';
import { Form, FormButtonRow } from '@/components/forms/form.styles';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Button, Title, Note, Input } from '@/components/ui';

type PasswordFormProps = {
  hasLocalPassword: boolean;
};

export default function PasswordForm({ hasLocalPassword }: PasswordFormProps) {
  const [state, formAction, pending] = useActionState<PasswordFormState, FormData>(changePassword, undefined);
  const [, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isDirty = !!(currentPassword || newPassword || confirmPassword);

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    if (state?.message && !state.errors) {
      startTransition(() => {
        handleCancel();
      });
    }
  }, [state?.message, state?.errors]);

  const title = hasLocalPassword ? 'Change password' : 'Set a local password';
  const description = hasLocalPassword
    ? 'Update the password used for logging in with email or nickname.'
    : 'You currently log in via an external provider. You can set a local password to log in directly as well.';

  const submitLabel = hasLocalPassword ? 'Change password' : 'Set password';

  return (
    <>
      <Title as='h1'>{title}</Title>
      <Note>{description}</Note>

      {state?.message && (
        <Note style={{ color: 'green', marginTop: 8 }} role='alert'>
          {state.message}
        </Note>
      )}

      <Form action={formAction}>
        {hasLocalPassword && (
          <FormFieldWrapper label='Current password' required error={state?.errors?.currentPassword?.[0]}>
            <Input
              type='password'
              name='currentPassword'
              autoComplete='current-password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder='Enter your current password'
            />
          </FormFieldWrapper>
        )}

        <FormFieldWrapper label='New password' required error={state?.errors?.newPassword?.[0]}>
          <Input
            type='password'
            name='newPassword'
            autoComplete='new-password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder='At least 6 chars, letters and numbers'
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Confirm new password' required error={state?.errors?.confirmPassword?.[0]}>
          <Input
            type='password'
            name='confirmPassword'
            autoComplete='new-password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Re-enter the new password'
          />
        </FormFieldWrapper>

        <FormButtonRow>
          <Button type='submit' disabled={pending || !isDirty}>
            {pending ? 'Saving…' : submitLabel}
          </Button>
          <Button type='button' onClick={handleCancel} disabled={pending}>
            Cancel
          </Button>
        </FormButtonRow>
      </Form>
    </>
  );
}
