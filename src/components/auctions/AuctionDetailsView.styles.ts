'use client';

import styled from 'styled-components';

export const Wrapper = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

/**
 * Images area
 */
export const ImagesWrapper = styled.div`
  display: flex;
  overflow-x: auto;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const MainImageBox = styled.div`
  flex: 0 0 280px;
  height: 220px;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ThumbImageBox = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1.5)};
  flex-wrap: wrap;

  > div {
    width: 72px;
    height: 72px;
    border-radius: ${({ theme }) => theme.radii.md};
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.bgElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    cursor: pointer;
  }
`;

/**
 * Description + long text
 */
export const DescriptionBox = styled.section`
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.bgElevated};
  font-size: ${({ theme }) => theme.typography.pSmallSize};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

/**
 * Right-hand side panels (meta, price, actions)
 */
export const Panel = styled.section`
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.bgElevated};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: ${({ theme }) => theme.typography.pSmallSize};
`;

export const PriceLabel = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const PriceValue = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  color: ${({ theme }) => theme.colors.text};
`;
