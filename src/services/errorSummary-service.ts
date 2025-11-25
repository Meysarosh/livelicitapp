export type SummaryItem = { field: string; message: string; inputId: string };

export function buildErrorSummary<TField extends string>(opts: {
  errors?: Partial<Record<TField, string[]>>;
  message?: string; // form-level error
  fieldMap: Record<TField, { label: string; inputId: string }>;
  fallbackInputId: string; // <-- required now
}): SummaryItem[] {
  const out: SummaryItem[] = [];

  // field errors
  if (opts.errors) {
    for (const key of Object.keys(opts.fieldMap) as TField[]) {
      const msgs = opts.errors[key];
      if (msgs && msgs[0]) {
        const meta = opts.fieldMap[key];
        out.push({ field: meta.label, message: msgs[0], inputId: meta.inputId });
      }
    }
  }

  // form-level error
  if (opts.message) {
    out.push({
      field: 'Form',
      message: opts.message,
      inputId: opts.fallbackInputId,
    });
  }

  return out;
}
