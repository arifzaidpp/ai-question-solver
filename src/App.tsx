import React from 'react';
import Camera from './components/Camera';
import { Camera as CameraIcon } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <CameraIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Question Solver</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Live Camera Feed</h2>
            <p className="mt-1 text-sm text-gray-500">
              Point your camera at a question, and the AI will analyze and provide an answer.
            </p>
          </div>
          
          <Camera />
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900">Instructions:</h3>
            <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-1">
              <li>Ensure good lighting and clear text visibility</li>
              <li>Keep the question centered in the frame</li>
              <li>Hold the camera steady for best results</li>
              <li>The system will automatically scan for questions every 5 seconds</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;