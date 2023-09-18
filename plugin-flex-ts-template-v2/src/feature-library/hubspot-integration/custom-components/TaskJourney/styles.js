import styled from '@emotion/styled';

export const AuthButton = styled('div')`
  letter-spacing: 2px;
  font-family: Arial;
  background: ${(props) => (props.authenticated ? (props.isOtherGuardian ? '#ff8f1b' : '#3ba339') : '#a33939')};
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;

  .iconAuth {
    margin-right: 5px;
    color: white;
    svg {
      width: 30px;
      height: 30px;
    }
  }
`;

export const InternationalButton = styled('div')`
  letter-spacing: 2px;
  font-family: Arial;
  background: #4c27a0;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  gap: 3rem;

  .iconAuth {
    margin-right: 5px;
    color: white;
    svg {
      width: 30px;
      height: 30px;
    }
  }
`;

export const Guardian = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem;
`;

export const International = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem;
`;

export const TaskReason = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffbc76;
  color: #fff;
`;

export const Journey = styled('button')`
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px 7px;
  margin: 5px 0;

  background: #cccccc80;
  color: #fff;
  cursor: pointer;
  border-radius: 5px;
  border: none;

  transition: transform 0.3s;

  &:hover {
    transform: scale(1.01);
    background: #cccccc95;
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
  height: 103vh;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);

  .modal-content {
    background-color: #fff;
    margin: calc(50vh - 33vh) auto;
    padding: 10px 25px;
    border: 1px solid #ccc;
    max-width: 50%;
    width: 500px;
    height: 65vh;

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
    color: #111;
    text-decoration: none;
    cursor: pointer;
  }
`;

export const Content = styled('div')`
  .title {
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
  }

  .transfer-text {
    padding: 0 1rem;

    span {
      font-weight: bold;
    }
  }

  ul {
    list-style: none;
    display: block;
    height: 52vh;
    overflow: auto;
    padding-right: 1rem;
  }

  li {
    background: #fff;
    margin: 0.5rem 0;
    border-radius: 5px;
    padding: 1rem;
    font-size: 1rem;
  }
`;
