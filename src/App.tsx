import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Uploader from "./routes/Uploader";
import Editor from "./routes/Editor";
import Recorder from "./routes/Recorder";
import SidebarNav from "./components/SidebarNav";
import { useAppState } from "./state/appState";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const { sidebarCollapsed } = useAppState();

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <SidebarNav />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <Routes>
            <Route path="/" element={<Navigate to="/uploader" replace />} />
            <Route path="/uploader" element={<Uploader />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/recorder" element={<Recorder />} />
            <Route path="/welcome" element={
              <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Welcome to NolanForge</h1>

                <div className="flex justify-center items-center space-x-8 mb-8">
                  <a href="https://vite.dev" target="_blank" className="transition-transform hover:scale-110">
                    <img src="/vite.svg" className="logo vite h-24 w-24" alt="Vite logo" />
                  </a>
                  <a href="https://tauri.app" target="_blank" className="transition-transform hover:scale-110">
                    <img src="/tauri.svg" className="logo tauri h-24 w-24" alt="Tauri logo" />
                  </a>
                  <a href="https://react.dev" target="_blank" className="transition-transform hover:scale-110">
                    <img src="/react.svg" className="logo react h-24 w-24" alt="React logo" />
                  </a>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Click on the Tauri, Vite, and React logos to learn more.</p>

                <form
                  className="flex items-center space-x-4 mb-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    greet();
                  }}
                >
                  <input
                    id="greet-input"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter a name..."
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Greet
                  </button>
                </form>
                {greetMsg && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">{greetMsg}</p>
                )}
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;