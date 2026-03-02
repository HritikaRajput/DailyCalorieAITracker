import { useState, useRef } from 'react';

const STATE = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing' };

const MIC_ICON = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const STOP_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2"/>
  </svg>
);

export default function VoiceRecorder({ mealType, userId, date, onMealRecorded, onError }) {
  const [status, setStatus] = useState(STATE.IDLE);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus(STATE.RECORDING);
    } catch {
      onError?.('Microphone access denied. Please allow microphone access and try again.');
    }
  }

  async function stopAndProcess() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    setStatus(STATE.PROCESSING);
    await new Promise((resolve) => {
      recorder.onstop = () => { recorder.stream?.getTracks().forEach((t) => t.stop()); resolve(); };
      recorder.stop();
    });
    try {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const { recordMeal } = await import('../api/client');
      const result = await recordMeal(blob, userId, mealType, date);
      onMealRecorded?.(result.meal, result.confidence);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setStatus(STATE.IDLE);
    }
  }

  const isRecording   = status === STATE.RECORDING;
  const isProcessing  = status === STATE.PROCESSING;

  return (
    <div style={styles.wrapper}>
      <button
        onClick={isRecording ? stopAndProcess : startRecording}
        disabled={isProcessing}
        style={{
          ...styles.btn,
          ...(isRecording  ? styles.btnRecording  : {}),
          ...(isProcessing ? styles.btnProcessing : {}),
        }}
        title={isRecording ? 'Stop recording' : 'Record meal'}
      >
        {isProcessing
          ? <span style={styles.spinner} />
          : isRecording
            ? STOP_ICON
            : MIC_ICON}
      </button>

      <span style={{ ...styles.label, color: isRecording ? '#DC2626' : '#717171' }}>
        {isProcessing ? 'Analysing…'
          : isRecording ? 'Tap to finish'
          : 'Tap to record'}
      </span>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '20px 0',
  },
  btn: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: 'none',
    background: '#1A1A1A',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.15s',
    flexShrink: 0,
  },
  btnRecording: {
    background: '#DC2626',
    animation: 'recording-ring 1.2s ease-out infinite',
  },
  btnProcessing: {
    background: '#EBEBEB',
    cursor: 'not-allowed',
    color: '#717171',
  },
  spinner: {
    width: 24,
    height: 24,
    border: '3px solid rgba(0,0,0,0.15)',
    borderTopColor: '#717171',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.01em',
  },
};
