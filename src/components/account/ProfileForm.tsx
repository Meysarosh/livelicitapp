'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { editUserProfile } from '@/app/actions/profile/editUserProfile';
import type { ProfileFormState } from '@/services/zodValidation-service';
import { Form, FormButtonRow } from '@/components/forms/form.styles';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Button, Title, Note, Input } from '@/components/ui';
import { Avatar } from './Avatar';
import { ProfileLinks } from '../layout';
import Link from 'next/link';

type ProfileFormProps = {
  user: {
    email: string;
    nickname: string | null;
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(editUserProfile, undefined);

  const initialFullName = user.fullName ?? '';
  const initialPhone = user.phone ?? '';

  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl);
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(
    () => () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    },
    [avatarPreview]
  );

  useEffect(() => {
    if (state?.message === 'Profile updated successfully.') {
      router.refresh();
    }
  }, [state?.message, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFileName(file.name);
    setAvatarChanged(true);

    const url = URL.createObjectURL(file);

    setAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return url;
    });
  };

  const isDirty = fullName !== initialFullName || phone !== initialPhone || avatarChanged;

  const handleCancel = () => {
    setFullName(initialFullName);
    setPhone(initialPhone);

    setAvatarPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return user.avatarUrl;
    });

    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
    setAvatarFileName(null);
    setAvatarChanged(false);
  };

  return (
    <>
      <Title as='h1'>Profile</Title>
      <Note>Update your personal details and avatar.</Note>

      <ProfileLinks>
        <Note>More settings:</Note>
        <Link href='/account/profile/address'>Shipping address</Link>
        <span>·</span>
        <Link href='/account/profile/password'>Password &amp; security</Link>
      </ProfileLinks>

      {state?.message && (
        <p role='alert' style={{ color: 'green', marginTop: 8 }}>
          {state.message}
        </p>
      )}
      {state?.errors?.avatar?.[0] && (
        <p role='alert' style={{ color: 'red', marginTop: 4 }}>
          {state.errors.avatar[0]}
        </p>
      )}

      <Form action={formAction}>
        <FormFieldWrapper label='Email'>
          <Input value={user.email} disabled />
        </FormFieldWrapper>

        <FormFieldWrapper label='Nickname'>
          <Input value={user.nickname ?? ''} disabled />
        </FormFieldWrapper>

        <FormFieldWrapper label='Full name' error={state?.errors?.fullName?.[0]}>
          <Input
            name='fullName'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder='Your name'
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Phone' error={state?.errors?.phone?.[0]}>
          <Input
            name='phone'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='Optional phone number'
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Avatar'>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar src={avatarPreview} alt='Avatar preview' preview />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input
                ref={avatarInputRef}
                type='file'
                name='avatar'
                id='avatar-upload'
                accept='image/*'
                onChange={handleAvatarChange}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  border: 0,
                }}
                aria-label='Upload avatar'
              />
              <label htmlFor='avatar-upload'>
                <Button
                  type='button'
                  onClick={() => avatarInputRef.current && avatarInputRef.current.click()}
                  tabIndex={0}
                  aria-controls='avatar-upload'
                >
                  Choose avatar
                </Button>
              </label>
              {avatarFileName && <span style={{ fontSize: 12 }}>Selected: {avatarFileName}</span>}
              <Note>Max size 5 MB. Square images look best.</Note>
            </div>
          </div>
        </FormFieldWrapper>

        <FormButtonRow>
          <Button type='submit' disabled={pending || !isDirty}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
          <Button type='button' onClick={handleCancel} disabled={pending}>
            Cancel
          </Button>
        </FormButtonRow>
      </Form>
    </>
  );
}
