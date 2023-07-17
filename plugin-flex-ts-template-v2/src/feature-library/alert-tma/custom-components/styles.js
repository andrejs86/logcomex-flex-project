import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0% {
    opacity: 0;
  }
  40%, 60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

export const StyledDiv = styled('div')`
  border-radius: 50%;
  width: 1.5em;
  height: 1.5em;
  align-self: center;
  animation: ${bounce} 3s ease infinite;
`;

export const StyledDivSupervisor = styled('div')`
  border-radius: 50%;
  width: 1em;
  height: 1em;
  align-self: center;
  margin: 0 5px;
  animation: ${bounce} 3s ease infinite;
`;
