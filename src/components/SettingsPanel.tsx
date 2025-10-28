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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-your-api-key-here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally and never shared
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={isSaving || !apiKey.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Testing...' : '🧪 Test Key'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : '💾 Save'}
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ How to get your API key:</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
              <li>2. Sign in to your OpenAI account</li>
              <li>3. Click "Create new secret key"</li>
              <li>4. Copy the key and paste it above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
