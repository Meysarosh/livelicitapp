'use client';

import { useActionState, useMemo, useState, useRef, useEffect } from 'react';
import { createAuction } from '@/app/actions/createAuction';
import {
  Form,
  ImagePreviewGrid,
  ImagePreviewItem,
  ImagePreviewImg,
  RemoveImageButton,
  ImageIndexBadge,
} from '@/components/forms/form.styles';
import { Button, Title, Note } from '@/components/ui';
import { Input, TextArea, Select } from '@/components/ui';
import { DEFAULT_CURRENCY, MAX_IMAGES, SUPPORTED_CURRENCIES } from '@/lib/constants';
import type { CreateAuctionFormState } from '@/services/zodValidation-service';
import { FormFieldWrapper } from '../forms/FormFieldWrapper';
import { isoToLocalForInput } from '@/services/format-service';

type ImageFileItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export default function CreateAuctionForm() {
  const [state, action, pending] = useActionState<CreateAuctionFormState, FormData>(createAuction, undefined);

  const startModeOptions = useMemo(
    () => [
      { value: 'now', label: 'Start now' },
      { value: 'future', label: 'Schedule for later' },
    ],
    []
  );

  const durationOptions = useMemo(
    () => [
      { value: '1', label: '1 day' },
      { value: '3', label: '3 days' },
      { value: '5', label: '5 days' },
      { value: '7', label: '7 days' },
      { value: 'test', label: 'Test (1 minute)' },
    ],
    []
  );

  const currencyOptions = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map((currency) => ({
        value: currency,
        label: currency,
      })),
    []
  );

  const initialLocalStartAt = useMemo(() => isoToLocalForInput(state?.values?.startAt), [state?.values?.startAt]);

  const [startMode, setStartMode] = useState<'now' | 'future'>(state?.values?.startMode ?? 'now');
  const [isoStartAt, setIsoStartAt] = useState(state?.values?.startAt ?? '');
  const [imageFiles, setImageFiles] = useState<ImageFileItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragItemIdRef = useRef<string | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    if (!val) {
      setIsoStartAt('');
      return;
    }
    const date = new Date(val);
    setIsoStartAt(date.toISOString());
  };

  const [minStartAt] = useState(() => {
    const now = new Date();
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    return iso;
  });

  useEffect(() => {
    return () => {
      imageFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [imageFiles]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageFiles((prev) => {
      // append new files to existing ones
      const remainingSlots = MAX_IMAGES - prev.length;
      const toAdd = files.slice(0, Math.max(0, remainingSlots));

      const newItems: ImageFileItem[] = toAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      const updated = [...prev, ...newItems];

      // sync <input type="file"> files
      syncInputFilesFromState(updated);

      return updated;
    });

    // clear the actual input so user can choose the same file again if they want
    e.target.value = '';
  };

  const syncInputFilesFromState = (items: ImageFileItem[]) => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    for (const item of items) {
      dt.items.add(item.file);
    }
    fileInputRef.current.files = dt.files;
  };

  const handleRemoveImage = (id: string) => {
    setImageFiles((prev) => {
      const remaining = prev.filter((item) => item.id !== id);
      const removed = prev.filter((item) => item.id === id);
      removed.forEach((item) => URL.revokeObjectURL(item.previewUrl));

      syncInputFilesFromState(remaining);
      return remaining;
    });
  };

  const handleDragStart = (id: string) => {
    dragItemIdRef.current = id;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    const sourceId = dragItemIdRef.current;
    dragItemIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;

    setImageFiles((prev) => {
      const sourceIndex = prev.findIndex((i) => i.id === sourceId);
      const targetIndex = prev.findIndex((i) => i.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const newArr = [...prev];
      const [moved] = newArr.splice(sourceIndex, 1);
      newArr.splice(targetIndex, 0, moved);

      syncInputFilesFromState(newArr);
      return newArr;
    });
  };

  return (
    <>
      <Title>Create auction</Title>

      {state?.message && (
        <Note role='alert' aria-live='polite'>
          {state.message}
        </Note>
      )}

      <Form action={action} encType='multipart/form-data'>
        <FormFieldWrapper label='Title' required error={state?.errors?.title?.[0]}>
          <Input name='title' type='text' defaultValue={state?.values?.title ?? ''} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Description' required error={state?.errors?.description?.[0]}>
          <TextArea name='description' defaultValue={state?.values?.description ?? ''} />
        </FormFieldWrapper>

        <FormFieldWrapper
          label='Images'
          error={state?.errors?.imageUrls?.[0]} // shows server-side validation
        >
          <input ref={fileInputRef} type='file' name='images' accept='image/*' multiple onChange={handleImagesChange} />
          <p style={{ fontSize: 12, marginTop: 4 }}>You can upload up to {MAX_IMAGES} images. Max size 5 MB each.</p>

          {imageFiles.length > 0 && (
            <ImagePreviewGrid>
              {imageFiles.map((item, index) => (
                <ImagePreviewItem
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(item.id)}
                >
                  <ImagePreviewImg src={item.previewUrl} alt={`Selected image ${index + 1}`} />
                  <RemoveImageButton type='button' onClick={() => handleRemoveImage(item.id)} aria-label='Remove image'>
                    ×
                  </RemoveImageButton>
                  <ImageIndexBadge>{index + 1}</ImageIndexBadge>
                </ImagePreviewItem>
              ))}
            </ImagePreviewGrid>
          )}
        </FormFieldWrapper>

        <FormFieldWrapper label='Starting price' required error={state?.errors?.startingPrice?.[0]}>
          <Input
            name='startingPrice'
            type='number'
            step='0.01'
            min={0}
            defaultValue={state?.values?.startingPrice ?? ''}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Minimum increment' required error={state?.errors?.minIncrement?.[0]}>
          <Input
            name='minIncrement'
            type='number'
            step='0.01'
            min={0}
            defaultValue={state?.values?.minIncrement ?? ''}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label='Start' error={state?.errors?.startMode?.[0]}>
          <Select
            name='startMode'
            value={startMode}
            onChange={(e) => setStartMode(e.target.value as 'now' | 'future')}
            options={startModeOptions}
          />
        </FormFieldWrapper>

        {startMode === 'future' && (
          <FormFieldWrapper label='Start date & time' required error={state?.errors?.startAt?.[0]}>
            <Input
              type='datetime-local'
              min={minStartAt}
              defaultValue={initialLocalStartAt}
              onChange={handleDateChange}
            />
            <input type='hidden' name='startAt' value={isoStartAt} />
          </FormFieldWrapper>
        )}

        <FormFieldWrapper label='Duration' required error={state?.errors?.durationDays?.[0]}>
          <Select name='durationDays' defaultValue={state?.values?.durationDays ?? '7'} options={durationOptions} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Currency' required error={state?.errors?.currency?.[0]}>
          <Select
            name='currency'
            defaultValue={state?.values?.currency ?? DEFAULT_CURRENCY}
            options={currencyOptions}
          />
        </FormFieldWrapper>

        <Button disabled={pending} type='submit'>
          {pending ? 'Creating…' : 'Create auction'}
        </Button>
      </Form>
    </>
  );
}
