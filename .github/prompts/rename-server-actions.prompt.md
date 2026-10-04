Refactor all exported server action functions in the `src/app/actions/` directory by appending the `Action` suffix to their names, and update all corresponding call sites across the codebase.

### Requirements:

1. **Target Functions:**
   - Inspect every file inside `src/app/actions/**/*.ts`.
   - Append `Action` to every exported server action function name that does not already end with `Action` (e.g., `createAuction` -> `createAuctionAction`, `toggleWatchlist` -> `toggleWatchlistAction`).
   - If helper functions are exported as actions, rename them accordingly; leave unexported internal helpers untouched unless their name collides.

2. **Global References & Imports:**
   - Update all imports and call sites across the entire project
   - Ensure named re-exports (if any exist in `index.ts` files) are updated cleanly.

3. **Safety & Verification:**
   - Do not alter the function arguments, return types, or internal logic.
   - Preserve existing `'use server'` directives.
   - Run type-checks / lint checks to ensure there are no broken imports or unresolved references.
