import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Loader2, Send, X, RefreshCw } from 'lucide-react';

const Camera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [answer, setAnswer] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [detectedText, setDetectedText] = useState<string>('');
  const lastProcessedText = useRef<string>('');

  // Function to send text to backend
  const sendToBackend = async (text: string) => {
    try {
      setProcessing(true);
      const response = await axios.post('/api/process-question', { text });
      setAnswer(response.data.answer);
      setDetectedText(''); // Clear the detected text after processing
    } catch (err) {
      console.error('Error processing question:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the question. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Function to process the captured image with OCR.Space
  const processImage = async (imgSrc: string) => {
    if (processing) return;

    setProcessing(true);
    setError('');
    
    try {
      // Format the request body according to OCR.Space requirements
      const formData = new URLSearchParams();
      formData.append('apikey', 'K87279297588957');
      formData.append('base64Image', imgSrc); // Send the complete data URL
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('filetype', 'JPG');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2'); // Use the more accurate OCR engine

      // Send image to OCR.Space API
      const response = await axios.post(
        'https://api.ocr.space/parse/image',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.ErrorMessage) {
        throw new Error(response.data.ErrorMessage);
      }

      const text = response.data.ParsedResults?.[0]?.ParsedText?.trim();
      
      // Skip if text is too short or the same as last processed
      if (!text || text.length < 10 || text === lastProcessedText.current) {
        if (!text) {
          setError('No text detected. Please try again.');
        }
        return;
      }

      // Clean up the detected text
      const cleanedText = text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[\n\r]+/g, ' ') // Replace newlines with spaces
        .trim();

      // Update last processed text and show it to user
      lastProcessedText.current = cleanedText;
      setDetectedText(cleanedText);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the image. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Function to capture an image from the webcam
  const capture = useCallback(() => {
    if (webcamRef.current && !processing && !detectedText) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        processImage(imageSrc);
      }
    }
  }, [processing, detectedText]);

  // Manual capture function
  const handleManualCapture = useCallback(() => {
    setDetectedText(''); // Clear previous text
    capture();
  }, [capture]);

  // Automatically capture and process images every 5 seconds
  useEffect(() => {
    if (detectedText) return;

    const interval = setInterval(capture, 5000);
    return () => clearInterval(interval);
  }, [capture, detectedText]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Webcam feed */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full rounded-lg shadow-lg"
        videoConstraints={{
          width: 1280,
          height: 720,
          facingMode: 'environment',
          aspectRatio: 16/9,
        }}
      />

      {/* Processing indicator */}
      {processing && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-500/70 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-2 hover:text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Manual capture button */}
      <button
        onClick={handleManualCapture}
        disabled={processing}
        className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className="w-4 h-4" />
        Rescan
      </button>

      {/* Detected text confirmation */}
      {detectedText && !processing && !error && (
        <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Detected Question:</h3>
            <button 
              onClick={() => setDetectedText('')}
              className="text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mb-4 text-gray-200 text-lg leading-relaxed">{detectedText}</p>
          <div className="flex justify-end">
            <button
              onClick={() => sendToBackend(detectedText)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 text-lg font-medium transition-colors"
            >
              <Send className="w-5 h-5" />
              Send for Answer
            </button>
          </div>
        </div>
      )}

      {/* Answer overlay */}
      {answer && !processing && !error && !detectedText && (
        <div className="absolute top-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">Answer:</h3>
            <button 
              onClick={() => setAnswer('')}
              className="text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default Camera;