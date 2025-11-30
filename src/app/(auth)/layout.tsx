import { FormSection, Container } from '@/components/layout/primitives';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <FormSection>
      <Container maxwidth='sm'>{children}</Container>
    </FormSection>
  );
}
