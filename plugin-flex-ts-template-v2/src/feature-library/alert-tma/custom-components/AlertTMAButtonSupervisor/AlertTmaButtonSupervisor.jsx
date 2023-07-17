import React from 'react';
import { connect } from 'react-redux';
import { withTheme } from '@twilio/flex-ui';

import { StyledDivSupervisor } from '../styles';
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
    const tmaType =
      this.props.task.channelType === 'whatsapp'
        ? getWhatsappMaxDuration()
        : this.props.task.channelType === 'voice'
        ? getVoiceMaxDuration()
        : '1800';

    // pega quantos segundos falta para os X minutos da variavel
    const MINUTES = Number(tmaType) * 1000;
    let delay = 0;
    if (this.state.delay <= 0 && !this.state.active && this.props.task._source.date_updated) {
      const duration = Date.now() - new Date(this.props.task._source.date_updated).getTime();
      if (duration < MINUTES) {
        delay = MINUTES - duration;
      }
      if (delay > 0) {
        this.timer = setTimeout(() => {
          this.setState({ delay: 0 });
        }, delay);
      }
      this.setState({ delay, active: true });
    }
  }

  render() {
    if (this.props.task._source.task_status === 'assigned' && this.state.active) {
      return <StyledDivSupervisor style={{ background: this.state.delay > 0 ? '#2cbd3a' : '#d32f2f' }} />;
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
