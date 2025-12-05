'use client';

import styled from 'styled-components';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: #f3f4f6;
    font-weight: 600;
  }
`;

export const ActionsCell = styled.td`
  display: flex;
  gap: 8px;
`;
