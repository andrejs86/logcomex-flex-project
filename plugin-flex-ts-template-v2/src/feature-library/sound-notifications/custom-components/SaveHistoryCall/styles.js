import styled from '@emotion/styled';

export const ContainerButton = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  cursor: pointer;

  &:hover {
    filter: brightness(0.9);
  }
`;

export const ContainerModal = styled('div')`
  display: block;
`;

export const Container = styled('div')`
  overflow-y: auto;
  height: 70vh;

  p.reasonTitle {
    padding: 10px;
    font-size: 1.5rem;
    font-family: 'Open Sans', sans-serif;
    text-transform: uppercase;
    color: ${(props) => props.theme.colors.base11};
  }

  p.fieldsRequiredTitle {
    color: red;
    font-size: 0.8rem;
    padding: 1px;
    padding-bottom: 4px;
  }

  #confirm-task-details {
    width: 98%;
  }

  button.topicButton {
    font-family: 'Open Sans', sans-serif;
    text-transform: uppercase;
    padding: 10px;
    text-align: center;
    margin: 5px 0;
    width: 100%;
    border: none;
    background: ${(props) => props.theme.colors.base3};
    color: ${(props) => props.theme.colors.base11};
    cursor: pointer;

    &:hover {
      filter: brightness(0.9);
    }
  }

  button.modalCloseButton {
    position: absolute;
    top: 10px;
    right: 10px;
    background: ${(props) => props.theme.colors.base3};
    border: none;
    cursor: pointer;

    &:hover {
      filter: brightness(0.9);
    }
  }

  button.modalHighlightedOption {
    background-color: #3dd70570;
  }

  button.modalConfirmButton {
    margin-top: 5px;
    border: none;
    padding: 2%;
    border-radius: 5px;
    background: ${(props) => props.theme.colors.base3};
    color: ${(props) => props.theme.colors.base11};
    cursor: pointer;
    filter: brightness(0.9);
    width: 50%;

    font-family: 'Open Sans', sans-serif;
    text-transform: uppercase;

    &:hover {
      filter: brightness(1);
    }

    &:disabled {
      filter: brightness(1);
      cursor: not-allowed;
    }
  }

  .reasonsSelect {
    border: 0.5px solid #00000055;
    padding: 5px;
    width: 100%;
    margin-bottom: 10px;
    background: ${(props) => props.theme.colors.base3};
    color: ${(props) => props.theme.colors.base11};
  }
`;

export const ContactHubspot = styled('div')`
  .text-bold {
    font-weight: bold;
  }
`;
