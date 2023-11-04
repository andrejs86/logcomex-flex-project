import React from 'react';
import { Select, Option } from '@twilio-paste/core/select';
import { Box } from '@twilio-paste/core/box';

import './styles.css';

class CustomQueueSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      skillsList: props.skills ? props.skills : [],
    };
  }

  render() {
    return (
      <>
        <Box className="custom-queue-select-dialpad">
          <Select
            name="queue-select-dialpad"
            id="queue-select-dialpad"
            className="skills-list-dialpad"
            defaultValue="Selecione uma skill"
          >
            {this.state.skillsList.map((skill) => (
              <Option key={skill} value={skill}>
                {skill.toUpperCase()}
              </Option>
            ))}
          </Select>
        </Box>
      </>
    );
  }
}

export default CustomQueueSelect;
