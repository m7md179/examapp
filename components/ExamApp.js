'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ExamApp = ({ questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correct_answer) {
        score++;
      }
    });
    return score;
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            Your score: {score} out of {questions.length}
          </p>
          <Button onClick={() => setShowResults(false)} className="mt-4">
            Review Answers
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">{question.question}</p>
        <RadioGroup
          value={selectedAnswers[question.id] || ''}
          onValueChange={(value) => handleAnswerSelect(question.id, value)}
        >
          {['option_1', 'option_2', 'option_3', 'option_4'].map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={question[option]} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{question[option]}</Label>
            </div>
          ))}
        </RadioGroup>
        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit}>Submit</Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={currentQuestion === questions.length - 1}
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamApp;