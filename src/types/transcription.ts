export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: Word[];
  segments?: Segment[];
}

export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface Segment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

export interface TranscriptionOptions {
  video_path: string;
  language?: string;
  output_format: 'srt' | 'vtt' | 'txt' | 'json';
}

export interface TranscriptionState {
  isProcessing: boolean;
  progress: number;
  transcript: TranscriptionResponse | null;
  error: string | null;
}
