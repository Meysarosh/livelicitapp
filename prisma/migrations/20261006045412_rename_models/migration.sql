-- 1. Rename the tables
ALTER TABLE "UserCredential" RENAME TO "Password";
ALTER TABLE "UserIdentity" RENAME TO "ProviderAccount";

-- 2. Rename the unique indexes
ALTER INDEX "UserCredential_userId_key" RENAME TO "Password_userId_key";
ALTER INDEX "UserIdentity_provider_providerUserId_key" RENAME TO "ProviderAccount_provider_providerUserId_key";

-- 3. Rename the primary key constraints
ALTER TABLE "Password" RENAME CONSTRAINT "UserCredential_pkey" TO "Password_pkey";
ALTER TABLE "ProviderAccount" RENAME CONSTRAINT "UserIdentity_pkey" TO "ProviderAccount_pkey";

-- 4. Rename the foreign key constraints
ALTER TABLE "Password" RENAME CONSTRAINT "UserCredential_userId_fkey" TO "Password_userId_fkey";
ALTER TABLE "ProviderAccount" RENAME CONSTRAINT "UserIdentity_userId_fkey" TO "ProviderAccount_userId_fkey";