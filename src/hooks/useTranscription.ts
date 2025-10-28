import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { TranscriptionResponse, TranscriptionOptions, TranscriptionState } from '../types/transcription';

export const useTranscription = () => {
  const [state, setState] = useState<TranscriptionState>({
    isProcessing: false,
    progress: 0,
    transcript: null,
    error: null,
  });

  const transcribeVideo = async (videoPath?: string) => {
    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null, progress: 0 }));

      // If no video path provided, open file dialog
      let selectedPath = videoPath;
      if (!selectedPath) {
        const selected = await open({
          multiple: false,
          filters: [
            {
              name: 'Video Files',
              extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'm4v'],
            },
          ],
        });

        if (!selected) {
          setState(prev => ({ ...prev, isProcessing: false }));
          return;
        }

        selectedPath = selected as string;
      }

      console.log('🎬 Starting transcription for:', selectedPath);

      // Update progress
      setState(prev => ({ ...prev, progress: 25 }));

      const options: TranscriptionOptions = {
        video_path: selectedPath,
        language: 'en', // Default to English, can be made configurable
        output_format: 'json',
      };

      // Update progress
      setState(prev => ({ ...prev, progress: 50 }));

      // Call Tauri command
      const transcript = await invoke<TranscriptionResponse>('transcribe_video', { options });

      console.log('✅ Transcription completed:', transcript);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        transcript,
        error: null,
      }));

      return transcript;
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error as string,
      }));
      throw error;
    }
  };

  const exportTranscript = async (format: 'srt' | 'vtt' | 'txt' | 'json') => {
    if (!state.transcript) {
      throw new Error('No transcript available to export');
    }

    try {
      // Open save dialog
      const selected = await save({
        defaultPath: `transcript.${format}`,
        filters: [
          {
            name: `${format.toUpperCase()} Files`,
            extensions: [format],
          },
        ],
      });

      if (!selected) {
        return;
      }

      const outputPath = selected as string;

      console.log(`📤 Exporting transcript as ${format} to:`, outputPath);

      await invoke('export_transcript', {
        transcript: state.transcript,
        outputPath,
        format,
      });

      console.log('✅ Transcript exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  };

  const clearTranscript = () => {
    setState({
      isProcessing: false,
      progress: 0,
      transcript: null,
      error: null,
    });
  };

  return {
    ...state,
    transcribeVideo,
    exportTranscript,
    clearTranscript,
  };
};
