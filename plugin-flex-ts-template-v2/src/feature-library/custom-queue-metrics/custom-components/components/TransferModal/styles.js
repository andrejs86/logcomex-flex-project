import styled from '@emotion/styled';

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
  background-color: rgba(0, 0, 0, 0.1);

  .modal-content {
    margin: 10% auto;
    padding: 10px 25px;
    max-width: 30%;
    width: 500px;

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

export const DirectoryContainer = styled('div')`
  display: flex;
  height: 60vh;
`;
