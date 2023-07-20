import { Notifications } from '@twilio/flex-ui';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import { Button } from '@twilio-paste/core/button';
import { MicrophoneOnIcon } from '@twilio-paste/icons/esm/MicrophoneOnIcon';
import { PauseIcon } from '@twilio-paste/icons/esm/PauseIcon';
import { PlayIcon } from '@twilio-paste/icons/esm/PlayIcon';
import { DeleteIcon } from '@twilio-paste/icons/esm/DeleteIcon';
import { UploadIcon } from '@twilio-paste/icons/esm/UploadIcon';
import { useEffect, useState } from 'react';

import { MainWrapper } from './styles';

const AudioRecorder = (props) => {
  const ALLOWED_CHANNELS = ['sms', 'whatsapp', 'facebook'];

  const [recordStatus, setRecordStatus] = useState('');
  const [microphoneAccess, setMicrophoneAccess] = useState(true);
  const [mp3Content, setMp3Content] = useState({
    blobUrl: '',
    file: {},
  });

  useEffect(() => {
    async function getMicPermission() {
      const micPermission = await navigator.permissions.query({
        name: 'microphone',
      });

      micPermission.onchange = (ev) => {
        setMicrophoneAccess(ev.target.state === 'granted');
      };

      setMicrophoneAccess(micPermission.state === 'granted');
    }

    getMicPermission();
  }, []);

  function playAudio() {
    const audio = new Audio(mp3Content.blobUrl);
    audio.play();
  }

  function checkIsAllow() {
    return !(props.disabledReason || ALLOWED_CHANNELS.includes(props.channel.source.attributes.channel_type));
  }

  async function sendAudio() {
    const { conversationSid } = props;

    try {
      await props.sendMediaService.sendMedia(mp3Content.file, conversationSid);

      setMp3Content({ blobUrl: '', file: {} });
      setRecordStatus('');
    } catch (err) {
      console.error(`Error when sending media message`, err);
    }
  }

  if (checkIsAllow()) {
    return null;
  }

  return (
    <MainWrapper>
      <AudioReactRecorder
        state={recordStatus}
        onStop={(audioData) => {
          setMp3Content({
            ...mp3Content,
            blobUrl: audioData.url,
            file: new File([audioData.blob], `${new Date().getTime()}-workerAudioFile.mp3`, { type: 'audio/mpeg' }),
          });
        }}
        backgroundColor="none"
        foregroundColor="none"
        canvasWidth={0}
        canvasHeight={0}
        type="audio/mpeg"
      />
      {(recordStatus === 'stop' || !recordStatus) && !mp3Content.blobUrl && (
        <Button
          variant="reset"
          element="AUDIO_RECORDER_BUTTON"
          disabled={checkIsAllow()}
          // eslint-disable-next-line consistent-return
          onClick={() => {
            if (!microphoneAccess) {
              Notifications.showNotification('recordAudioError');
              return;
            }
            setRecordStatus(RecordState.START);
          }}
        >
          <MicrophoneOnIcon decorative={false} title="Iniciar gravação de áudio" />
        </Button>
      )}
      {recordStatus === 'start' && (
        <Button
          variant="reset"
          element="AUDIO_RECORDER_BUTTON"
          disabled={checkIsAllow()}
          onClick={() => setRecordStatus(RecordState.STOP)}
        >
          <PauseIcon decorative={false} title="Parar gravação de áudio" />
        </Button>
      )}
      {mp3Content.blobUrl && (
        <>
          <Button
            variant="reset"
            element="AUDIO_RECORDER_BUTTON"
            disabled={checkIsAllow()}
            onClick={() => {
              setMp3Content({ blobUrl: '', file: {} });
              setRecordStatus('');
            }}
          >
            <DeleteIcon decorative={false} title="Cancelar áudio gravado" />
          </Button>
          <Button variant="reset" element="AUDIO_RECORDER_BUTTON" disabled={checkIsAllow()} onClick={() => playAudio()}>
            <PlayIcon decorative={false} title="Escutar áudio gravado" />
          </Button>
        </>
      )}
      {mp3Content.file && mp3Content.file.name && (
        <Button
          variant="reset"
          element="AUDIO_RECORDER_BUTTON"
          disabled={checkIsAllow()}
          onClick={async () => sendAudio()}
        >
          <UploadIcon decorative={false} title="Enviar áudio gravado" />
        </Button>
      )}
    </MainWrapper>
  );
};

export default AudioRecorder;
