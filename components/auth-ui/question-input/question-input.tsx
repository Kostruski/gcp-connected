'use client';

import { useState } from 'react';

interface QuestionInputProps {
  onQuestionSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
  placeholder?: string;
}

export default function QuestionInput({
  onQuestionSubmit,
  isLoading,
  submitButtonText = 'Submit Question',
  placeholder = 'Type your question here...',
}: QuestionInputProps) {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null); // Clear previous errors
    if (!question.trim()) {
      setError('Please enter a question before submitting.');
      return;
    }

    try {
      await onQuestionSubmit(question);
      setQuestion(''); // Clear input after successful submission
    } catch (err) {
      // The parent component's onQuestionSubmit should handle and display API errors.
      // This catch is for unexpected client-side errors during submission.
      setError('An unexpected error occurred during submission.');
      console.error('Client-side error submitting question:', err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Post Your Question
      </h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="question-textarea" className="sr-only">
          Your Question
        </label>
        <textarea
          id="question-textarea"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading || !question.trim()}
        className={`w-full py-2 px-4 rounded-md font-bold text-white transition duration-200 ease-in-out ${
          isLoading || !question.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? 'Submitting...' : submitButtonText}
      </button>
    </div>
  );
}
