import React, { useState } from 'react';
import { useTranscription } from '../hooks/useTranscription';

interface TranscriptionPanelProps {
  onClose?: () => void;
  initialVideoPath?: string;
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ onClose, initialVideoPath }) => {
  const {
    isProcessing,
    progress,
    transcript,
    error,
    transcribeVideo,
    exportTranscript,
    clearTranscript,
  } = useTranscription();

  const [selectedFormat, setSelectedFormat] = useState<'srt' | 'vtt' | 'txt' | 'json'>('srt');

  const handleTranscribe = async () => {
    try {
      await transcribeVideo(initialVideoPath);
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportTranscript(selectedFormat);
      alert(`Transcript exported as ${selectedFormat.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error}`);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🎬 AI Video Transcription</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Transcription Controls */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <button
              onClick={handleTranscribe}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '🔄 Processing...' : '🎤 Start Transcription'}
            </button>

            {transcript && (
              <button
                onClick={clearTranscript}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                🗑️ Clear
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">Progress: {progress}%</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-4">
            {/* Transcript Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">📊 Transcript Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Language:</span> {transcript.language || 'Auto-detected'}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {transcript.duration ? formatTime(transcript.duration) : 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Segments:</span> {transcript.segments?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Characters:</span> {transcript.text.length}
                </div>
              </div>
            </div>

            {/* Export Controls */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">📤 Export Transcript</h3>
              <div className="flex gap-4 items-center">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="srt">SRT (SubRip)</option>
                  <option value="vtt">VTT (WebVTT)</option>
                  <option value="txt">TXT (Plain Text)</option>
                  <option value="json">JSON (Raw Data)</option>
                </select>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  💾 Export
                </button>
              </div>
            </div>

            {/* Transcript Text */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📝 Full Transcript</h3>
              <div className="max-h-96 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{transcript.text}</p>
              </div>
            </div>

            {/* Segments with Timestamps */}
            {transcript.segments && transcript.segments.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">⏰ Timestamped Segments</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {transcript.segments.map((segment, index) => (
                    <div key={segment.id} className="border-l-4 border-blue-500 pl-3 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          Segment {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(segment.start)} → {formatTime(segment.end)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!transcript && !isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ Instructions</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {initialVideoPath ? (
                <>
                  <li>• Video file is pre-selected for transcription</li>
                  <li>• Click "Start Transcription" to begin AI processing</li>
                </>
              ) : (
                <>
                  <li>• Click "Start Transcription" to select a video file</li>
                </>
              )}
              <li>• The AI will extract audio and transcribe it using OpenAI Whisper</li>
              <li>• Transcription may take a few minutes depending on video length</li>
              <li>• Export in SRT, VTT, TXT, or JSON format</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
