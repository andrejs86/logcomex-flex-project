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

    .skill-text {
      color: #d00;
      font-weight: bold;
    }
  }

  .custom-bold-text {
    font-weight: bold;
  }
`;
