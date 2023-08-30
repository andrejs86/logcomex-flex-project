import styled from '@emotion/styled';

export const Container = styled('div')`
  .div-activity-modal {
    display: flex;
    align-items: center;
  }

  ${
    '' /* .custom-activity-modal:nth-child(n + 2) {
    margin-top: 2rem;
  } */
  }

  .task-state {
    display: inline-block;
    margin-left: 14px;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .only-task {
    border-radius: 10px;
    display: block;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: left;
    font-size: 1rem;
    line-height: 2rem;
  }

  .custom-bold-text {
    font-weight: bold;
  }
`;

export const TaskHeader = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .buttons-container {
    display: flex;
    gap: 0.5rem;

    button {
      font-size: 1rem;
      color: #222;
      font-weight: bold;
      border-radius: 5px;
      padding: 0.5rem 1.5rem;
      border: none;
      opacity: 0.7;

      :hover {
        cursor: pointer;
        scale: 1.03;
        opacity: 1;
      }
    }

    .finish {
      background: #f28705;
    }
    .transfer {
      background: #70d95f;
    }
  }
`;

export const TransferContainer = styled('div')`
  z-index: 1000;
`;
