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

export const ButtonList = styled('li')`
  button {
    background: none;
    border: none;
    cursor: pointer;

    display: flex;
    align-items: center;
    gap: 5px;

    font-weight: bold;
    font-family: 'Open Sans';
    font-size: 12px;
    -webkit-font-smoothing: antialiased;

    width: 70%;
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

  .tasks-list-icon {
    &:disabled {
      cursor: not-allowed;
    }
  }

  .tasks-list {
    text-align: left;
  }
`;

export const Modal = styled('div')`
  display: block;
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
    max-width: 50%;
    width: 842px;
    background-color: white;
    display: flex;
    flex-direction: column;
    text-align: center;

    border-radius: 24px;

    .queue-text {
      font-size: 1.3rem;
      margin-bottom: 1.4rem;
      font-weight: bold;
    }
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

  .text-modal {
    line-height: 2;
    font-size: 1.03rem;

    .modal-button {
      margin-bottom: 0.8rem;
      background: none;
      border: none;
      width: 40%;
      font-size: 1.2rem;
      color: #888;
      padding: 0.8rem 0;
      cursor: pointer;
    }

    .active {
      border-bottom: solid 3px #ccc;
      color: #000;
      font-weight: bold;
    }
  }
`;

export const Divisor = styled('div')`
  width: 100%;
  height: 1px;
  background: #777981;
  margin: 24px 0 32px;
`;

export const List = styled('ul')`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.4rem;

  li {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .channel-list {
    margin-left: 2rem;
  }
`;
