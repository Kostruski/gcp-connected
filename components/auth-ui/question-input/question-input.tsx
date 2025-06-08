'use client';

import { useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'; // Import Button component

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
    <div>
      <h2>Post Your Question</h2>
      {error && <p>{error}</p>}
      <div>
        <FloatingLabel controlId="floatingTextarea" label="Your Question">
          <Form.Control
            as="textarea"
            placeholder={placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            style={{ height: '100px' }} // You might want to adjust this height as needed
          />
        </FloatingLabel>
      </div>
      <Button onClick={handleSubmit} disabled={isLoading || !question.trim()}>
        {isLoading ? 'Submitting...' : submitButtonText}
      </Button>
    </div>
  );
}
