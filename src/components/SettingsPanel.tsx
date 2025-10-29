import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load existing API key from storage
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const stored = await invoke<string>('get_stored_api_key');
      if (stored) {
        setApiKey(stored);
      }
    } catch (error) {
      console.log('No stored API key found');
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter your OpenAI API key' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await invoke('store_api_key', { apiKey: apiKey.trim() });
      setMessage({ type: 'success', text: 'API key saved successfully!' });
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save API key: ${error}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter your OpenAI API key first' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await invoke('test_api_key', { apiKey: apiKey.trim() });
      setMessage({ type: 'success', text: 'API key is valid and working!' });
    } catch (error) {
      setMessage({ type: 'error', text: `API key test failed: ${error}` });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
      <div className="glass rounded-3xl border border-gray-700/30 backdrop-blur-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                ⚙️
              </div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center text-gray-300 hover:text-white text-xl transition-all duration-300 hover:scale-105"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-your-api-key-here"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              />
              <p className="text-xs text-gray-400 mt-2">
                Your API key is stored locally and never shared
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl border backdrop-blur-sm ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
                  <span className="font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={isSaving || !apiKey.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-glow disabled:shadow-none disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Testing...</span>
                  </span>
                ) : (
                  '🧪 Test Key'
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !apiKey.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-glow disabled:shadow-none disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </span>
                ) : (
                  '💾 Save'
                )}
              </button>
            </div>

            {/* Info Section */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                <span>How to get your API key:</span>
              </h3>
              <ol className="text-sm text-yellow-200/90 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">1.</span>
                  <span>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300 transition-colors">platform.openai.com/api-keys</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">2.</span>
                  <span>Sign in to your OpenAI account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">3.</span>
                  <span>Click "Create new secret key"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">4.</span>
                  <span>Copy the key and paste it above</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
