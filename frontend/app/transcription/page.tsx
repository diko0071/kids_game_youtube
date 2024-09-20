'use client'

import { useState } from 'react';

export default function YoutubeTranscription() {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/youtube-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }), 
      });

      console.log(response)

      if (!response.ok) {
        throw new Error('Failed to fetch transcription');
      }

      const data = await response.json();
      setTranscription(data.transcription || "Error fetching transcription");
    } catch (error) {
      setTranscription('An error occurred');
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="border border-gray-300 rounded p-2"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white rounded p-2"
        >
          Get Transcription
        </button>
      </form>
      {transcription && (
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{transcription}</pre>
      )}
    </div>
  );
}