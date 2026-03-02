import { useState, useRef } from 'react';

const STATE = { IDLE: 'idle', RECORDING: 'recording', PROCESSING: 'processing' };

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
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => stream.getTracks().forEach((t) => t.stop());

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus(STATE.RECORDING);
    } catch (err) {
      onError?.('Microphone access denied. Please allow microphone access and try again.');
    }
  }

  async function stopAndProcess() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    setStatus(STATE.PROCESSING);

    await new Promise((resolve) => {
      recorder.onstop = () => {
        recorder.stream?.getTracks().forEach((t) => t.stop());
        resolve();
      };
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

  const isRecording = status === STATE.RECORDING;
  const isProcessing = status === STATE.PROCESSING;

  return (
    <div style={styles.wrapper}>
      <button
        onClick={isRecording ? stopAndProcess : startRecording}
        disabled={isProcessing}
        style={{
          ...styles.btn,
          ...(isRecording ? styles.btnRecording : {}),
          ...(isProcessing ? styles.btnProcessing : {}),
        }}
      >
        {isProcessing ? '⏳ Processing…' : isRecording ? '⏹ Stop & Analyse' : '🎙 Record Meal'}
      </button>
      {isRecording && <div style={styles.pulse}>Recording…</div>}
    </div>
  );
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  btn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnRecording: { background: '#ef4444' },
  btnProcessing: { background: '#6b7280', cursor: 'not-allowed' },
  pulse: { fontSize: 13, color: '#ef4444', animation: 'pulse 1s infinite' },
};
