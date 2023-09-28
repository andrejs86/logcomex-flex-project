import styled from '@emotion/styled';

export const Container = styled('div')`
  .kill-task {
    background: none;
    border: 1px solid #aaaa;
    z-index: 999;
    padding: 5px 15px;
    opacity: 0.6;

    margin: 5px 0 5px 8px;

    font-size: 10px;
    font-weight: bold;
    color: #000;

    cursor: pointer;

    transition: all 250ms ease-in-out;

    span {
      display: inline-block;
      margin-top: 4px;
    }
  }

  .kill-task:hover {
    opacity: 1;
    background: red;
    border: none;

    color: #fff;
    font-weight: bold;
  }
`;
