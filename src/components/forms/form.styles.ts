'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const FormField = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  display: inline-flex;
  align-items: baseline;
  color: ${({ theme }) => theme.colors.text};
`;

export const RequiredMark = styled.abbr.attrs({ title: 'required' })`
  color: ${({ theme }) => theme.colors.danger};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  margin-left: ${({ theme }) => theme.spacing(0.5)};
`;

export const SCLink = styled(Link)`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`;

export const Summary = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.danger};
  background: rgba(220, 38, 38, 0.1);
  color: ${({ theme }) => theme.colors.danger};
  padding: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.radii.md};
`;

export const SummaryList = styled.ul`
  margin: ${({ theme }) => theme.spacing(1)} 0 0 0;
  padding-left: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.typography.pSmallSize};
`;

export const Divider = styled.div`
  margin: ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const CenteredRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const ImagePreviewGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const ImagePreviewItem = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ImagePreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  border: none;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 12px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
`;

export const ImageIndexBadge = styled.span`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
`;

export const ExistingImageWrapper = styled(ImagePreviewItem)<{ $deleted?: boolean }>`
  opacity: ${({ $deleted }) => ($deleted ? 0.4 : 1)};
`;

export const DeletedOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
`;

export const FormButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
