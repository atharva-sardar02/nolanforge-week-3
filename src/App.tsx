import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Uploader from "./routes/Uploader";
import Editor from "./routes/Editor";
import Recorder from "./routes/Recorder";
import Navbar from "./components/Navbar";

function App() {

  return (
    <Router>
      <div className="flex flex-col h-screen w-full bg-gray-950 overflow-hidden">
        <Navbar />
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/uploader" replace />} />
            <Route path="/uploader" element={<Uploader />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/recorder" element={<Recorder />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;