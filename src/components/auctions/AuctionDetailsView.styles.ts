'use client';

import styled from 'styled-components';

export const Wrapper = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  align-items: flex-start;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const LeftColumn = styled.div`
  display: grid;
  gap: 16px;
`;

export const RightColumn = styled.div`
  display: grid;
  gap: 16px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

export const ImagesWrapper = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

export const MainImageBox = styled.div`
  flex: 0 0 280px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
`;

export const ThumbImageBox = styled.div`
  flex: 0 0 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
`;

export const DescriptionBox = styled.div`
  padding: 12px;
  border-radius: 12px;
  background: #f9fafb;
  font-size: 14px;
  line-height: 1.5;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
`;

export const Badge = styled.span<{ $tone?: 'success' | 'danger' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: ${({ $tone }) => ($tone === 'success' ? '#ecfdf3' : $tone === 'danger' ? '#fef2f2' : '#e5e7eb')};
  color: ${({ $tone }) => ($tone === 'success' ? '#166534' : $tone === 'danger' ? '#b91c1c' : '#374151')};
`;

export const Panel = styled.div`
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: grid;
  gap: 10px;
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
`;

export const PriceLabel = styled.span`
  color: #6b7280;
`;

export const PriceValue = styled.span`
  font-weight: 600;
`;

export const ActionsTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

export const Small = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b7280;
`;
