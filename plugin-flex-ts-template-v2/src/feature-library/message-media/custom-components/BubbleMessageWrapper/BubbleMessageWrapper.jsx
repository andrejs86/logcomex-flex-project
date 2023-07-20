import React, { Component } from 'react';

import { BubbleMessageWrapperDiv } from './BubbleMessageWrapper.Styles';
import MediaMessageComponent from '../MediaMessage/MediaMessage';

class MessageImageComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mediaUrl: '',
    };
  }

  async componentDidMount() {
    if (!this.state.mediaUrl) {
      const message = this.props.message.source;
      const mediaUrl =
        message.attachedMedia && message.attachedMedia.length > 0
          ? await message.attachedMedia[0].getContentTemporaryUrl()
          : '';

      if (mediaUrl) {
        this.setState({ mediaUrl });
      }
    }
  }

  async componentDidUpdate() {
    if (!this.state.mediaUrl) {
      const message = this.props.message.source;
      const mediaUrl =
        message.attachedMedia && message.attachedMedia.length > 0
          ? await message.attachedMedia[0].getContentTemporaryUrl()
          : '';

      if (this.state.mediaUrl === mediaUrl) return;

      if (mediaUrl) {
        this.setState({ mediaUrl });
      }
    }
  }

  render() {
    const message = this.props.message.source;
    if (message.type === 'media' && this.state.mediaUrl) {
      return (
        <BubbleMessageWrapperDiv>
          <MediaMessageComponent mediaUrl={this.state.mediaUrl} mediaType={message.media.contentType} />
        </BubbleMessageWrapperDiv>
      );
    }

    // if it is not media
    return <div />;
  }
}

export default MessageImageComponent;
