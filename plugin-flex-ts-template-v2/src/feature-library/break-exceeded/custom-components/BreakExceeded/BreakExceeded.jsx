import React from 'react';
import { connect } from 'react-redux';
import { withTheme } from '@twilio/flex-ui';

import { StyledDiv } from './styles';

class BreakExceeded extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      delay: 0,
      active: false,
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    return <StyledDiv />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapStateToProps = (state, ownProps) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(withTheme(BreakExceeded));
