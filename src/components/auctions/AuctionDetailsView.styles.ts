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
