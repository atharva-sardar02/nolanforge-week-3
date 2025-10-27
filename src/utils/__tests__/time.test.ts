import { describe, it, expect } from 'vitest'
import {
  formatTime,
  formatTimeWithMilliseconds,
  parseTime,
  frameToTime,
  timeToFrame,
  clampTime,
  snapToFrame,
  timeToPercentage,
  percentageToTime,
  validateTrimRange,
  formatDurationHuman,
  getFrameStep,
  formatTimecode,
} from '../time'

describe('time utilities', () => {
  describe('formatTime', () => {
    it('formats time correctly without hours', () => {
      expect(formatTime(0)).toBe('00:00')
      expect(formatTime(30)).toBe('00:30')
      expect(formatTime(90)).toBe('01:30')
      expect(formatTime(125)).toBe('02:05')
    })

    it('formats time correctly with hours', () => {
      expect(formatTime(3600)).toBe('01:00:00')
      expect(formatTime(3665)).toBe('01:01:05')
      expect(formatTime(7325)).toBe('02:02:05')
    })

    it('handles force include hours', () => {
      expect(formatTime(30, true)).toBe('00:00:30')
      expect(formatTime(90, true)).toBe('00:01:30')
    })

    it('handles invalid input', () => {
      expect(formatTime(NaN)).toBe('00:00')
      expect(formatTime(Infinity)).toBe('00:00')
    })
  })

  describe('formatTimeWithMilliseconds', () => {
    it('formats time with milliseconds', () => {
      expect(formatTimeWithMilliseconds(0)).toBe('00:00.000')
      expect(formatTimeWithMilliseconds(30.123)).toBe('00:30.123')
      expect(formatTimeWithMilliseconds(90.456)).toBe('01:30.456')
    })

    it('formats time with hours and milliseconds', () => {
      expect(formatTimeWithMilliseconds(3600.789)).toBe('01:00:00.789')
    })

    it('handles invalid input', () => {
      expect(formatTimeWithMilliseconds(NaN)).toBe('00:00.000')
    })
  })

  describe('parseTime', () => {
    it('parses MM:SS format', () => {
      expect(parseTime('00:00')).toBe(0)
      expect(parseTime('00:30')).toBe(30)
      expect(parseTime('01:30')).toBe(90)
      expect(parseTime('02:05')).toBe(125)
    })

    it('parses HH:MM:SS format', () => {
      expect(parseTime('01:00:00')).toBe(3600)
      expect(parseTime('01:01:05')).toBe(3665)
      expect(parseTime('02:02:05')).toBe(7325)
    })

    it('parses with milliseconds', () => {
      expect(parseTime('00:30.500')).toBe(30.5)
      expect(parseTime('01:00:00.250')).toBe(3600.25)
    })

    it('handles invalid input', () => {
      expect(parseTime('')).toBe(0)
      expect(parseTime('invalid')).toBe(0)
      expect(parseTime('99:99:99')).toBeNaN()
    })
  })

  describe('frameToTime', () => {
    it('converts frames to time at 30fps', () => {
      expect(frameToTime(0)).toBe(0)
      expect(frameToTime(30)).toBe(1)
      expect(frameToTime(60)).toBe(2)
      expect(frameToTime(15)).toBeCloseTo(0.5, 5)
    })

    it('converts frames at different fps', () => {
      expect(frameToTime(24, 24)).toBe(1)
      expect(frameToTime(60, 60)).toBe(1)
      expect(frameToTime(25, 25)).toBe(1)
    })
  })

  describe('timeToFrame', () => {
    it('converts time to frames at 30fps', () => {
      expect(timeToFrame(0)).toBe(0)
      expect(timeToFrame(1)).toBe(30)
      expect(timeToFrame(2)).toBe(60)
      expect(timeToFrame(0.5)).toBe(15)
    })

    it('converts time at different fps', () => {
      expect(timeToFrame(1, 24)).toBe(24)
      expect(timeToFrame(1, 60)).toBe(60)
      expect(timeToFrame(1, 25)).toBe(25)
    })

    it('floors fractional frames', () => {
      expect(timeToFrame(1.99, 30)).toBe(59)
      expect(timeToFrame(0.99, 30)).toBe(29)
    })
  })

  describe('clampTime', () => {
    it('clamps time within range', () => {
      expect(clampTime(5, 0, 10)).toBe(5)
      expect(clampTime(-5, 0, 10)).toBe(0)
      expect(clampTime(15, 0, 10)).toBe(10)
    })

    it('handles edge cases', () => {
      expect(clampTime(0, 0, 10)).toBe(0)
      expect(clampTime(10, 0, 10)).toBe(10)
    })
  })

  describe('snapToFrame', () => {
    it('snaps time to nearest frame', () => {
      expect(snapToFrame(0.016, 30)).toBeCloseTo(0.0333, 3)
      expect(snapToFrame(0.5, 30)).toBeCloseTo(0.5, 3)
      expect(snapToFrame(1.017, 30)).toBeCloseTo(1.0333, 3)
    })

    it('snaps at different fps', () => {
      expect(snapToFrame(0.041, 24)).toBeCloseTo(0.0416, 3)
      expect(snapToFrame(0.016, 60)).toBeCloseTo(0.0166, 3)
    })
  })

  describe('timeToPercentage', () => {
    it('converts time to percentage', () => {
      expect(timeToPercentage(5, 0, 10)).toBe(0.5)
      expect(timeToPercentage(0, 0, 10)).toBe(0)
      expect(timeToPercentage(10, 0, 10)).toBe(1)
    })

    it('clamps percentage', () => {
      expect(timeToPercentage(-5, 0, 10)).toBe(0)
      expect(timeToPercentage(15, 0, 10)).toBe(1)
    })

    it('handles zero range', () => {
      expect(timeToPercentage(5, 10, 10)).toBe(0)
    })
  })

  describe('percentageToTime', () => {
    it('converts percentage to time', () => {
      expect(percentageToTime(0.5, 0, 10)).toBe(5)
      expect(percentageToTime(0, 0, 10)).toBe(0)
      expect(percentageToTime(1, 0, 10)).toBe(10)
    })

    it('handles offset ranges', () => {
      expect(percentageToTime(0.5, 10, 20)).toBe(15)
      expect(percentageToTime(0.25, 100, 200)).toBe(125)
    })

    it('clamps percentage', () => {
      expect(percentageToTime(-0.5, 0, 10)).toBe(0)
      expect(percentageToTime(1.5, 0, 10)).toBe(10)
    })
  })

  describe('validateTrimRange', () => {
    it('validates correct trim range', () => {
      const result = validateTrimRange(0, 10, 20)
      expect(result.valid).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('rejects negative start', () => {
      const result = validateTrimRange(-5, 10, 20)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('negative')
    })

    it('rejects end beyond duration', () => {
      const result = validateTrimRange(0, 25, 20)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('exceed')
    })

    it('rejects start >= end', () => {
      const result = validateTrimRange(10, 5, 20)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('before')
    })

    it('rejects too short duration', () => {
      const result = validateTrimRange(5, 5.05, 20)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('100ms')
    })
  })

  describe('formatDurationHuman', () => {
    it('formats seconds', () => {
      expect(formatDurationHuman(0)).toBe('0 seconds')
      expect(formatDurationHuman(1)).toBe('1 second')
      expect(formatDurationHuman(30)).toBe('30 seconds')
    })

    it('formats minutes', () => {
      expect(formatDurationHuman(60)).toBe('1 minute')
      expect(formatDurationHuman(90)).toBe('1 minute, 30 seconds')
      expect(formatDurationHuman(120)).toBe('2 minutes')
    })

    it('formats hours', () => {
      expect(formatDurationHuman(3600)).toBe('1 hour')
      expect(formatDurationHuman(3665)).toBe('1 hour, 1 minute, 5 seconds')
      expect(formatDurationHuman(7200)).toBe('2 hours')
    })

    it('handles invalid input', () => {
      expect(formatDurationHuman(NaN)).toBe('0 seconds')
    })
  })

  describe('getFrameStep', () => {
    it('returns correct frame step', () => {
      expect(getFrameStep(30)).toBeCloseTo(0.0333, 4)
      expect(getFrameStep(24)).toBeCloseTo(0.0416, 4)
      expect(getFrameStep(60)).toBeCloseTo(0.0166, 4)
    })
  })

  describe('formatTimecode', () => {
    it('formats timecode correctly', () => {
      expect(formatTimecode(0, 30)).toBe('00:00:00:00')
      expect(formatTimecode(1, 30)).toBe('00:00:01:00')
      expect(formatTimecode(1.5, 30)).toBe('00:00:01:15')
    })

    it('formats with hours', () => {
      expect(formatTimecode(3600, 30)).toBe('01:00:00:00')
      expect(formatTimecode(3661, 30)).toBe('01:01:01:00')
    })

    it('handles different frame rates', () => {
      expect(formatTimecode(1, 24)).toBe('00:00:01:00')
      expect(formatTimecode(1, 60)).toBe('00:00:01:00')
    })

    it('handles invalid input', () => {
      expect(formatTimecode(NaN, 30)).toBe('00:00:00:00')
    })
  })

  describe('round-trip conversions', () => {
    it('formats and parses consistently', () => {
      const time = 125.5
      const formatted = formatTime(time)
      const parsed = parseTime(formatted)
      expect(parsed).toBeCloseTo(125, 0) // Loses milliseconds in MM:SS format
    })

    it('frame conversions are consistent', () => {
      const frames = 75
      const time = frameToTime(frames, 30)
      const backToFrames = timeToFrame(time, 30)
      expect(backToFrames).toBe(frames)
    })

    it('percentage conversions are consistent', () => {
      const time = 7.5
      const percentage = timeToPercentage(time, 0, 15)
      const backToTime = percentageToTime(percentage, 0, 15)
      expect(backToTime).toBe(time)
    })
  })
})


