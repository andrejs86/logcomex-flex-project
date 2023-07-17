import React from 'react';
import { connect } from 'react-redux';
import { withTheme } from '@twilio/flex-ui';

import { StyledDiv } from '../styles';
import { getVoiceMaxDuration, getWhatsappMaxDuration } from '../../config';

class AlertTmaButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      delay: 0,
      active: false,
      accountSid: props.manager.serviceConfiguration.account_sid,
    };
  }

  componentDidMount() {
    this.setDelay();
  }

  componentDidUpdate() {
    this.setDelay();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  async setDelay() {
    const maxHandlingTime =
      this.props.task.channelType === 'whatsapp'
        ? getWhatsappMaxDuration() * 1000
        : this.props.task.channelType === 'voice'
        ? getVoiceMaxDuration() * 1000
        : '1800000'; // 30 min.

    let timeLeft = 0;
    if (this.state.delay <= 0 && !this.state.active && this.props.task.attributes.dateAcceptTask) {
      let elapsedTime = Date.now() - new Date(this.props.task.attributes.dateAcceptTask).getTime();
      if (elapsedTime < 0) elapsedTime = 0;
      timeLeft =
        new Date(this.props.task.attributes.dateAcceptTask).getTime() +
        Number(maxHandlingTime) -
        elapsedTime -
        Date.now();

      if (timeLeft > 0) {
        this.timer = setTimeout(() => {
          console.log('Alert TMA - Timeout!');
          this.setState({ delay: 0 });
        }, timeLeft);

        this.setState({ delay: timeLeft, active: true });
      } else {
        this.setState({ delay: 0, active: true });
      }
    }
  }

  render() {
    if (this.props.task._task.status === 'assigned' && this.state.active) {
      return <StyledDiv style={{ background: this.state.delay > 0 ? '#2cbd3a' : '#d32f2f' }} />;
    }
    return null;
  }
}

const mapStateToProps = (state) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(withTheme(AlertTmaButton));
