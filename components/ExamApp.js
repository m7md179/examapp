'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Input } from './ui/input';

const ExamApp = ({ majors, subjectTypes, subjects, questions }) => {
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedSubjectType, setSelectedSubjectType] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10); // Default number of questions
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [examStarted, setExamStarted] = useState(false); // State to manage exam start

  // Filter subjects based on selected major and subject type
  const filteredSubjects = subjects.filter(subject => 
    subject.major_id === selectedMajor && subject.subject_type_id === selectedSubjectType
  );

  // Filter questions based on the selected subject
  const getShuffledQuestions = () => {
    const filtered = questions.filter(question => question.subject_id === selectedSubject);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length));
  };

  const [examQuestions, setExamQuestions] = useState([]);

  useEffect(() => {
    if (selectedSubject) {
      setExamQuestions(getShuffledQuestions());
      setCurrentQuestion(0); // Reset to the first question
    }
  }, [selectedSubject, numberOfQuestions]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let score = 0;
    examQuestions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correct_answer) {
        score++;
      }
    });
    return score;
  };

  if (showReview) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Exam Review</CardTitle>
        </CardHeader>
        <CardContent>
          {examQuestions.map((question, index) => (
            <div key={question.id} className="mb-6">
              <p className="text-lg font-semibold mb-2">Question {index + 1}: {question.question}</p>
              <p className={`mb-1 ${selectedAnswers[question.id] === question.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
                Your answer: {selectedAnswers[question.id]}
              </p>
              {selectedAnswers[question.id] !== question.correct_answer && (
                <p className="text-green-600">Correct answer: {question.correct_answer}</p>
              )}
            </div>
          ))}
          <Button onClick={() => setShowReview(false)} className="mt-4">
            Back to Results
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            Your score: {score} out of {examQuestions.length}
          </p>
          <Button onClick={() => setShowReview(true)} className="mt-4 mr-4">
            Review Answers
          </Button>
          <Link href="/">
            <Button onClick={() => setShowResults(false)} className="mt-4">
              Start New Exam
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!examStarted) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Select Exam Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={(value) => setSelectedMajor(parseInt(value))}>
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select Major" />
            </SelectTrigger>
            <SelectContent>
              {majors.map(major => (
                <SelectItem key={major.id} value={major.id.toString()}>{major.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            onValueChange={(value) => setSelectedSubjectType(parseInt(value))}
            disabled={selectedMajor === null}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select Subject Type" />
            </SelectTrigger>
            <SelectContent>
              {subjectTypes.map(type => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.is_university ? 'University ' : 'Major '}
                  {type.is_mandatory ? 'Mandatory' : 'Optional'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            onValueChange={(value) => setSelectedSubject(parseInt(value))}
            disabled={selectedSubjectType === null || filteredSubjects.length === 0}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {filteredSubjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            min="1"
            max={questions.filter(q => q.subject_id === selectedSubject).length}
            className="mb-4"
            placeholder="Number of questions"
            disabled={!selectedSubject}
          />
          
          <Button 
            onClick={() => setExamStarted(true)} 
            disabled={!selectedSubject}
          >
            Start Exam
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = examQuestions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Question {currentQuestion + 1} of {examQuestions.length}</CardTitle>
      </CardHeader>
      <CardContent>
        {question ? (
          <>
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
              {currentQuestion === examQuestions.length - 1 ? (
                <Button onClick={handleSubmit}>Submit</Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={currentQuestion === examQuestions.length - 1}
                >
                  Next
                </Button>
              )}
            </div>
          </>
        ) : (
          <p>No questions available for the selected subject.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default ExamApp;
