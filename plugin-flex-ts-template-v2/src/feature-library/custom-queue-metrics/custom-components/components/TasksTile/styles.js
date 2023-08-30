import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const loadingD = keyframes`
  0% {
  transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const Container = styled('button')`
  border: none;
  font-family: 'Open Sans', sans-serif;
  text-align: left;
  cursor: pointer;
  padding: 12px;
  display: flex;
  flex-direction: column;

  span {
    margin-bottom: 4px;
    letter-spacing: 2px;
    font-size: 10px;
    min-height: 30px;
    text-transform: uppercase;
    font-weight: bold;
  }

  p {
    font-size: 48px;
    font-weight: 600;
  }

  .ring-1 {
    width: 3px;
    height: 3px;
    margin: 0 auto;
    border: 5px dashed #4b9cdb;
    border-radius: 100%;
  }

  .load-4 .ring-1 {
    animation: ${loadingD} 1.5s 0.3s cubic-bezier(0.17, 0.37, 0.43, 0.67) infinite;
  }
`;

export const Modal = styled('div')`
  display: none;
  position: fixed;
  z-index: 10;
  margin: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);

  .modal-content {
    margin: 5% auto;
    padding: 10px 25px;
    padding-bottom: 25px;
    max-width: 50%;
    width: 842px;
    background-color: white;
    display: flex;
    flex-direction: column;
    text-align: center;

    border-radius: 24px;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 32px;
    font-weight: bold;

    display: flex;
    justify-content: flex-end;
  }

  .close:hover,
  .close:focus {
    text-decoration: none;
    cursor: pointer;
  }
`;

export const Divisor = styled('div')`
  width: 100%;
  height: 1px;
  background: #777981;
  margin: 24px 0 32px;
`;
