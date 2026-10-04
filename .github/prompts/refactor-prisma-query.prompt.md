---
description: Refactor a data-access function into a typed Prisma validator pattern
---

You are refactoring a data-access function to use Prisma validator args and inferred payload types.

Given the selected function in `#selection`:

1. Check workspace usages of this function to determine strictly needed fields.
2. Create or update `export const <name>Args = Prisma.validator<Prisma.<Model>DefaultArgs>()({ ... })` in the corresponding `#file:types/*.ts` file.
3. Export the payload type: `export type <Name> = Prisma.<Model>GetPayload<typeof <name>Args>;`
4. Update the data-access function to import and spread `<name>Args`, setting the return type to `Promise<<Name>>` (or `Promise<<Name>[]>`).
