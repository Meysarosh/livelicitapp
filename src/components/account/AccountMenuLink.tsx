'use client';

import { Route } from 'next';
import { usePathname } from 'next/navigation';
import { StyledLink } from '../layout';

type Props = {
  href: string;
  children: React.ReactNode;
};

export default function AccountMenuLink({ href, children }: Props) {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <StyledLink href={href as Route} $active={isActive}>
      {children}
    </StyledLink>
  );
}
