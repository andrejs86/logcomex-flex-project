import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const bounce = keyframes`

  0% {
    opacity: 0;
  }

  20%, 80% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
`;

export const StyledDiv = styled('div')`
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  background: #d32f2f;
  animation: ${bounce} 5s ease infinite;
`;
