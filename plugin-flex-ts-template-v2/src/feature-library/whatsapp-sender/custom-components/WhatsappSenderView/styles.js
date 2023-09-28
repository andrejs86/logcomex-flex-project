import styled from '@emotion/styled';

import { selectStyleDefault } from '../commonStyles';

export const Container = styled('div')`
  width: 800px;
  margin: 50px 30px;
  display: flex;

  h1 {
    font-weight: 700;
    font-size: 20px;
  }
`;

export const Preview = styled('div')`
  margin: 0 50px;
  position: relative;

  p {
    width: 150px;
    position: absolute;
    top: 90px;
    left: 20px;
    background: #fff;
    padding: 10px 5px;
    border-radius: 10px;
    font-size: small;
  }
`;

export const Form = styled('form')`
  padding: 10px;
  .input-block {
    margin: 10px 0;
    display: flex;
    flex-direction: column;

    label {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    input {
      width: initial;
      border: 1px solid #dcdde3;
      padding: 16px 15px;
      font-size: 15px;
    }

    select {
      ${selectStyleDefault('100%')}
    }
  }

  button {
    height: 54px;
    width: 100%;
    margin-top: 15px;
    border-radius: 10px;
    cursor: pointer;
    background: #5c068c;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.2s;
    border: none;

    &:hover {
      background: #430466;
    }

    &:disabled {
      cursor: initial;
      background: #5c068c99;
    }
  }
`;

export const LoadingContainer = styled('div')`
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #00000035;
`;
