import React, { Component } from 'react';

import { ImageWrapper, AudioPlayerWrapper, PdfViewerWrapper, VideoPlayerWrapper } from './MediaMessage.Styles';

class MediaMessageComponent extends Component {
  renderImage = () => {
    const { mediaUrl } = this.props;

    return (
      <ImageWrapper>
        <img src={mediaUrl} alt="Image" style={{ width: '300px', maxWidth: 'calc(100% - 0.5rem)' }} />
      </ImageWrapper>
    );
  };

  renderAudioPlayer = () => {
    const { mediaUrl, mediaType } = this.props;

    return (
      <AudioPlayerWrapper>
        <audio controls>
          <source src={mediaUrl} type={mediaType} />
        </audio>
      </AudioPlayerWrapper>
    );
  };

  renderPdfViewer = () => {
    const { mediaUrl } = this.props;

    return (
      <PdfViewerWrapper>
        <iframe title="PDF Preview" src={mediaUrl} style={{ width: '300px', maxWidth: 'calc(100% - 0.5rem)' }} />
      </PdfViewerWrapper>
    );
  };

  renderVideoPlayer = () => {
    const { mediaUrl, mediaType } = this.props;

    return (
      <VideoPlayerWrapper>
        <video controls key={mediaUrl} style={{ width: '300px', maxWidth: 'calc(100% - 0.5rem)' }}>
          <source src={mediaUrl} type={mediaType} />
        </video>
      </VideoPlayerWrapper>
    );
  };

  renderGenericFileExtension = () => {
    return <div></div>;
  };

  resizeExternalLink = () => {
    document.querySelectorAll('.Twilio-Media-MessageBubble').forEach((mb) => {
      mb.style.width = '300px';
    });
  };

  removeAudioAndVideoExternalLink = () => {
    document.querySelectorAll('audio').forEach((a) => {
      const c = a.parentElement?.parentElement?.parentElement;
      if (c && c.children && c.children?.length > 1) {
        c.children[1].style.display = 'none';
      }
    });

    document.querySelectorAll('video').forEach((a) => {
      const c = a.parentElement?.parentElement?.parentElement;
      if (c && c.children && c.children?.length > 1) {
        c.children[1].style.display = 'none';
      }
    });
  };

  render() {
    const { mediaType } = this.props;

    switch (mediaType) {
      case 'image/jpeg':
      case 'image/png':
        this.resizeExternalLink();
        return this.renderImage();
      case 'audio/mpeg':
      case 'audio/ogg':
      case 'audio/amr':
        this.removeAudioAndVideoExternalLink();
        this.resizeExternalLink();
        return this.renderAudioPlayer();
      case 'application/pdf':
        this.resizeExternalLink();
        return this.renderPdfViewer();
      case 'video/mp4':
        this.removeAudioAndVideoExternalLink();
        this.resizeExternalLink();
        return this.renderVideoPlayer();
      default:
        return this.renderGenericFileExtension();
    }
  }
}

export default MediaMessageComponent;
