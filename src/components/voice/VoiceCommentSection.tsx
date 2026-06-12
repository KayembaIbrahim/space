'use client';

import { useState, useEffect } from 'react';
import { Mic, Play, Pause, Loader2, Send } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';
import { useMediaRecorder } from '@/hooks';
import VoiceCommentCard from './VoiceCommentCard';
import type { VoiceComment } from '@/types';

interface VoiceCommentSectionProps {
  postId: string;
}

export default function VoiceCommentSection({ postId }: VoiceCommentSectionProps) {
  const [comments, setComments] = useState<VoiceComment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { startRecording, stopRecording } = useMediaRecorder();
  const maxDuration = 60;
  const minDuration = 2;

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= maxDuration) {
            stopRecording();
            setIsRecording(false);
            return t;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, stopRecording]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/voice?postId=${postId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch voice comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecording = async () => {
    setRecordingTime(0);
    setAudioBlob(null);
    setIsRecording(true);
    await startRecording((blob) => {
      setAudioBlob(blob);
      setIsRecording(false);
    });
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };

  const handleUpload = async () => {
    if (!audioBlob || recordingTime < minDuration) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-comment.webm');
      formData.append('postId', postId);
      formData.append('duration', recordingTime.toString());

      const res = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setAudioBlob(null);
        setRecordingTime(0);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <Mic size={16} className="text-[var(--accent)]" />
        <span className="text-sm font-medium text-[var(--text-secondary)]">Voice Replies</span>
        <span className="text-xs text-[var(--text-tertiary)]">({comments.length})</span>
      </div>

      {/* Recording Controls */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        {isRecording ? (
          <>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-medium text-red-500">Recording</span>
              </div>

              {/* Waveform Visualizer */}
              <div className="flex items-end gap-0.5 h-8">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[var(--accent)] rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.random() * 100}%`,
                      opacity: i < (recordingTime / maxDuration) * 30 ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
              {formatDuration(recordingTime)}
              <span className="text-[var(--text-tertiary)]"> / {formatDuration(maxDuration)}</span>
            </span>

            <button
              onClick={handleStopRecording}
              className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <div className="w-4 h-4 rounded-sm bg-white" />
            </button>
          </>
        ) : audioBlob ? (
          <>
            <audio controls src={URL.createObjectURL(audioBlob)} className="flex-1 h-8" />
            <span className="text-sm font-mono text-[var(--text-secondary)]">
              {formatDuration(recordingTime)}
            </span>
            <button
              onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
              className="px-3 py-1.5 text-sm text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading || recordingTime < minDuration}
              className={cn(
                'btn-primary text-sm flex items-center gap-1.5',
                recordingTime < minDuration && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Send
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleStartRecording}
              className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Mic size={20} className="text-white" />
            </button>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Record a voice reply</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {minDuration}-{maxDuration} seconds
              </p>
            </div>
          </>
        )}
      </div>

      {/* Voice Comments List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-tertiary)] py-4">
          No voice replies yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <VoiceCommentCard
              key={comment.id}
              comment={comment}
              onDelete={() => handleDelete(comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
