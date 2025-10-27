import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock document.documentElement
Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    },
  },
})
