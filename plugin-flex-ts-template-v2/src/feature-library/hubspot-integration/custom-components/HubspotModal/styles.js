import styled from '@emotion/styled';

export const HubspotIcon = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;

  img {
    cursor: pointer;
    width: 24px;
    height: 24px;
    margin-right: 10px;
  }

  img:hover {
    filter: brightness(0.9);
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
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
`;

export const PhoneContainer = styled('div')`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
    background: none;
    border: none;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;

    &:disabled {
      cursor: not-allowed;
      filter: brightness(0.5);
    }

    &:hover {
      transform: scale(1.1);
      fill: #aaa;
    }
  }

  svg {
    width: 28px;
    height: 28px;
  }
`;

export const SuspendedContainer = styled('button')`
  width: 100%;
  padding: 1.2rem 0.8rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: start;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  text-align: left;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    filter: brightness(88%);
  }
`;
