'use client';

import { useActionState, useMemo, useState, useRef, useEffect } from 'react';
import {
  Form,
  ImagePreviewGrid,
  ImagePreviewItem,
  ImagePreviewImg,
  RemoveImageButton,
  ImageIndexBadge,
  ExistingImageWrapper,
  DeletedOverlay,
} from '@/components/forms/form.styles';
import { Button, Title, Note, Input, TextArea, Select, Muted } from '@/components/ui';
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, MAX_IMAGES } from '@/lib/constants';
import { durationDayOptions, type CreateAuctionFormState } from '@/services/zodValidation-service';
import { FormFieldWrapper } from '../forms/FormFieldWrapper';
import { isoToLocalForInput } from '@/services/format-service';

type AuctionFormMode = 'create' | 'edit';

type AuctionFormProps = {
  mode: AuctionFormMode;
  action: (prevState: CreateAuctionFormState, formData: FormData) => Promise<CreateAuctionFormState>;
  initialValues?: {
    title?: string;
    description?: string;
    startingPrice?: string;
    minIncrement?: string;
    durationDays?: (typeof durationDayOptions)[number];
    currency?: string;
    startMode?: 'now' | 'future';
    startAt?: string;
  };
  existingImages?: { id: string; url: string }[];
  submitLabel?: string;
};

type ImageFileItem = {
  id: string;
  file: File;
  previewUrl: string;
};

type ExistingImageItem = {
  id: string;
  url: string;
  deleted?: boolean;
};

export default function AuctionForm({ mode, action, initialValues, existingImages, submitLabel }: AuctionFormProps) {
  const [state, formAction, pending] = useActionState<CreateAuctionFormState, FormData>(action, undefined);

  const startModeOptions = useMemo(
    () => [
      { value: 'now', label: 'Start immediately' },
      { value: 'future', label: 'Schedule start' },
    ],
    []
  );

  const durationOptions = useMemo(
    () =>
      durationDayOptions.map((value) => ({
        value,
        label: value === 'test' ? 'Test (1 minute)' : `${value} days`,
      })),
    []
  );

  const currencyOptions = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map((c) => ({
        value: c,
        label: c,
      })),
    []
  );

  const [startMode, setStartMode] = useState<'now' | 'future'>(
    (state?.values?.startMode as 'now' | 'future') ?? initialValues?.startMode ?? 'now'
  );

  const [isoStartAt, setIsoStartAt] = useState(() => {
    const raw = state?.values?.startAt ?? initialValues?.startAt ?? new Date().toISOString();
    return raw;
  });

  const handleStartModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === 'future' ? 'future' : 'now';
    setStartMode(val);
  };

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
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 16);
  });

  const [existingImagesState, setExistingImagesState] = useState<ExistingImageItem[]>(() =>
    (existingImages ?? []).map((img) => ({ id: img.id, url: img.url, deleted: false }))
  );
  const existingDragIdRef = useRef<string | null>(null);

  const handleExistingDragStart = (id: string) => {
    existingDragIdRef.current = id;
  };

  const handleExistingDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleExistingDrop = (targetId: string) => {
    const sourceId = existingDragIdRef.current;
    existingDragIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;

    setExistingImagesState((prev) => {
      const sourceIndex = prev.findIndex((i) => i.id === sourceId);
      const targetIndex = prev.findIndex((i) => i.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const newArr = [...prev];
      const [moved] = newArr.splice(sourceIndex, 1);
      newArr.splice(targetIndex, 0, moved);

      return newArr;
    });
  };

  const handleExistingToggleDelete = (id: string) => {
    setExistingImagesState((prev) => prev.map((img) => (img.id === id ? { ...img, deleted: !img.deleted } : img)));
  };

  const imagesMetaJson = useMemo(() => {
    if (mode !== 'edit') {
      return '';
    }

    const existingOrder = existingImagesState.filter((i) => !i.deleted).map((i) => i.id);
    const deletedIds = existingImagesState.filter((i) => i.deleted).map((i) => i.id);

    if (!existingOrder.length && !deletedIds.length) {
      return '';
    }

    return JSON.stringify({ existingOrder, deletedIds });
  }, [mode, existingImagesState]);

  const [imageFiles, setImageFiles] = useState<ImageFileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      imageFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [imageFiles]);

  const syncInputFilesFromState = (items: ImageFileItem[]) => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    for (const item of items) {
      dt.items.add(item.file);
    }
    fileInputRef.current.files = dt.files;
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageFiles((prev) => {
      const remainingSlots = MAX_IMAGES - prev.length;
      const toAdd = files.slice(0, Math.max(0, remainingSlots));

      const newItems: ImageFileItem[] = toAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      const updated = [...prev, ...newItems];

      syncInputFilesFromState(updated);

      return updated;
    });

    e.target.value = '';
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

  const titleValue = state?.values?.title ?? initialValues?.title ?? '';
  const descriptionValue = state?.values?.description ?? initialValues?.description ?? '';
  const startingPriceValue = state?.values?.startingPrice ?? initialValues?.startingPrice ?? '';
  const minIncrementValue = state?.values?.minIncrement ?? initialValues?.minIncrement ?? '';
  const durationValue = state?.values?.durationDays ?? initialValues?.durationDays ?? '7';
  const currencyValue = state?.values?.currency ?? initialValues?.currency ?? DEFAULT_CURRENCY;

  const submitText = submitLabel ?? (mode === 'edit' ? 'Save changes' : 'Create auction');

  return (
    <>
      <Title as='h1'>{mode === 'edit' ? 'Edit auction' : 'Create a new auction'}</Title>

      <Note>
        {mode === 'edit'
          ? 'Update your auction details and optionally add more images.'
          : 'Fill out the form to create a new auction.'}
      </Note>

      {state?.message && (
        <Note role='alert' aria-live='polite'>
          {state.message}
        </Note>
      )}

      <Form action={formAction}>
        <FormFieldWrapper label='Title' required error={state?.errors?.title?.[0]}>
          <Input name='title' defaultValue={titleValue} placeholder='Awesome item title' />
        </FormFieldWrapper>

        <FormFieldWrapper label='Description' required error={state?.errors?.description?.[0]}>
          <TextArea name='description' defaultValue={descriptionValue} placeholder='Describe your item in detail...' />
        </FormFieldWrapper>

        <FormFieldWrapper label='Starting price' required error={state?.errors?.startingPrice?.[0]}>
          <Input name='startingPrice' type='number' step='0.01' min='0' defaultValue={startingPriceValue} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Minimum increment' required error={state?.errors?.minIncrement?.[0]}>
          <Input name='minIncrement' type='number' step='0.01' min='0' defaultValue={minIncrementValue} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Duration' required error={state?.errors?.durationDays?.[0]}>
          <Select name='durationDays' defaultValue={durationValue} options={durationOptions} />
        </FormFieldWrapper>

        <FormFieldWrapper label='Start mode' required error={state?.errors?.startMode?.[0]}>
          <Select
            name='startMode'
            defaultValue={startMode}
            onChange={handleStartModeChange}
            options={startModeOptions}
          />
        </FormFieldWrapper>

        {startMode === 'future' && (
          <FormFieldWrapper label='Start date & time' error={state?.errors?.startAt?.[0]}>
            <Input
              type='datetime-local'
              name='startAt'
              min={minStartAt}
              defaultValue={isoStartAt ? isoToLocalForInput(isoStartAt) : ''}
              onChange={handleDateChange}
            />
          </FormFieldWrapper>
        )}

        <FormFieldWrapper label='Currency' required error={state?.errors?.currency?.[0]}>
          <Select name='currency' defaultValue={currencyValue} options={currencyOptions} />
        </FormFieldWrapper>

        {mode === 'edit' && existingImagesState.length > 0 && (
          <FormFieldWrapper label='Current images'>
            <ImagePreviewGrid>
              {existingImagesState.map((img, index) => (
                <ExistingImageWrapper
                  key={img.id}
                  $deleted={img.deleted}
                  draggable={!img.deleted}
                  onDragStart={() => !img.deleted && handleExistingDragStart(img.id)}
                  onDragOver={handleExistingDragOver}
                  onDrop={() => !img.deleted && handleExistingDrop(img.id)}
                >
                  <ImagePreviewImg src={img.url} alt={`Existing image ${index + 1}`} />
                  <RemoveImageButton
                    type='button'
                    onClick={() => handleExistingToggleDelete(img.id)}
                    aria-label={img.deleted ? 'Undo remove image' : 'Remove image'}
                  >
                    {img.deleted ? '↺' : '×'}
                  </RemoveImageButton>
                  <ImageIndexBadge>{index + 1}</ImageIndexBadge>
                  {img.deleted && <DeletedOverlay>Will be removed</DeletedOverlay>}
                </ExistingImageWrapper>
              ))}
            </ImagePreviewGrid>
            <Note>
              Drag to reorder. Click × to mark for deletion (↺ to undo). New uploads will be added after the kept
              images.
            </Note>
          </FormFieldWrapper>
        )}

        {mode === 'edit' && <input type='hidden' name='imagesMeta' value={imagesMetaJson} />}

        <FormFieldWrapper label='New images' error={state?.errors?.imageUrls?.[0]}>
          <input ref={fileInputRef} type='file' name='images' accept='image/*' multiple onChange={handleImagesChange} />
          <Muted>You can upload up to {MAX_IMAGES} new images at once. Max size 5 MB each.</Muted>

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

        <Button disabled={pending} type='submit'>
          {pending ? (mode === 'edit' ? 'Saving…' : 'Creating…') : submitText}
        </Button>
      </Form>
    </>
  );
}
