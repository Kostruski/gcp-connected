'use client';

import { useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Locale, TranslationKey } from '../../types';
import trans, { Params } from '../../translations/translate';

interface QuestionInputProps {
  onQuestionSubmit: (question: string) => Promise<void>;
  isLoading: boolean;
  locale: Locale;
}

export default function QuestionInput({
  onQuestionSubmit,
  isLoading,
  locale,
}: QuestionInputProps) {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const t = (key: TranslationKey, params?: Params) =>
    trans(locale, key, params); // Ensure 'trans' can access 'readPageTranslations' or is general enough

  const handleSubmit = async () => {
    setError(null); // Clear previous errors
    if (!question.trim()) {
      setError(t('question_input_error_empty'));
      return;
    }

    try {
      await onQuestionSubmit(question);
      setQuestion(''); // Clear input after successful submission
    } catch (err) {
      setError(t('question_input_error_unexpected'));
      console.error('Client-side error submitting question:', err);
    }
  };

  return (
    <div>
      <h2>{t('question_input_title')}</h2>
      {error && <p className="text-danger">{error}</p>}{' '}
      <div className="mb-4">
        <FloatingLabel
          controlId="floatingTextarea"
          label={t('question_input_label')}
        >
          <Form.Control
            as="textarea"
            placeholder={t('question_input_default_placeholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            style={{ height: '100px' }}
          />
        </FloatingLabel>
      </div>
      <Button onClick={handleSubmit} disabled={isLoading || !question.trim()}>
        {isLoading
          ? t('question_input_submitting_button')
          : t('question_input_submit_button')}
      </Button>
    </div>
  );
}
