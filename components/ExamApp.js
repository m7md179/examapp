// components/ExamApp.js

// components/ExamApp.js

'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox'; // Fixed import

const ExamApp = ({ majors, subjectTypes, subjects, questions, suggestedQuestions }) => {
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [isMandatory, setIsMandatory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [questionType, setQuestionType] = useState('normal');
  const [error, setError] = useState(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [examMode, setExamMode] = useState(null);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState(null);

  // Filter subjects based on selected major and mandatory/optional status
  const filteredSubjects = subjects.filter(subject => 
    subject.major_id === selectedMajor && 
    subjectTypes.find(st => st.id === subject.subject_type_id)?.is_mandatory === isMandatory
  );

  const getShuffledQuestions = () => {
    const questionPool = questionType === 'normal' ? questions : suggestedQuestions;

    if (!Array.isArray(questionPool) || questionPool.length === 0) {
      setError(`No ${questionType} questions available. Please try a different question type or contact the administrator.`);
      return [];
    }

    let filtered = questionPool.filter(question => question.subject_id === selectedSubject);

    if (questionType === 'normal' && selectedChapters.length > 0) {
      filtered = filtered.filter(question => selectedChapters.includes(question.chapter));
    }

    if (questionType === 'suggested' && selectedExamType && selectedExamType !== 'all') {
      filtered = filtered.filter(question => question.exam_type === selectedExamType);
    }

    if (filtered.length === 0) {
      setError(`No ${questionType} questions available for the selected criteria. Please try different options.`);
      return [];
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length));
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examStarted && !showResults) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examStarted, showResults]);

  useEffect(() => {
    if (selectedSubject && questionType) {
      const shuffledQuestions = getShuffledQuestions();
      setExamQuestions(shuffledQuestions);
      setCurrentQuestion(0);
      if (shuffledQuestions.length > 0) {
        setError(null);
      }
    }
  }, [selectedSubject, numberOfQuestions, questionType, selectedChapters, selectedExamType]);

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

  const handleFinishExam = () => {
    setShowFinishConfirmation(true);
  };

  const confirmFinishExam = () => {
    setShowFinishConfirmation(false);
    handleSubmit();
  };

  const getChapters = () => {
    if (!selectedSubject) return [];
    const subjectQuestions = questions.filter(q => q.subject_id === selectedSubject);
    return [...new Set(subjectQuestions.map(q => q.chapter))];
  };

  const getExamTypes = () => {
    if (!selectedSubject) return [];
    const subjectSuggestedQuestions = suggestedQuestions.filter(q => q.subject_id === selectedSubject);
    return [...new Set(subjectSuggestedQuestions.map(q => q.exam_type))];
  };
  
  const renderAvailableOptions = (question) => {
    const options = ['option_1', 'option_2', 'option_3', 'option_4'].filter(option => question[option]);
    return options.map((option, index) => (
      <div key={index} className="flex items-center space-x-2 mb-2">
        <RadioGroupItem value={question[option]} id={`option-${index}`} />
        <Label htmlFor={`option-${index}`}>{question[option]}</Label>
      </div>
    ));
  };

  const handleChapterChange = (chapter) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(ch => ch !== chapter)
        : [...prev, chapter]
    );
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

  if (!examMode) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Select Exam Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setExamMode('one-way')}>One-Way Exam</Button>
            <Button onClick={() => setExamMode('two-way')}>Two-Way Exam</Button>
          </div>
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
          <p className="mb-4">Exam Mode: {examMode === 'one-way' ? 'One-Way' : 'Two-Way'}</p>
          
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
            onValueChange={(value) => setIsMandatory(value === 'true')}
            disabled={selectedMajor === null}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select Subject Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Mandatory</SelectItem>
              <SelectItem value="false">Optional</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            onValueChange={(value) => setSelectedSubject(parseInt(value))}
            disabled={isMandatory === null || filteredSubjects.length === 0}
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

          <Select 
            onValueChange={(value) => {
              setQuestionType(value);
              setSelectedChapters([]);
              setSelectedExamType(null);
            }} 
            disabled={selectedSubject === null}
          >
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Select Question Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal Questions</SelectItem>
              <SelectItem value="suggested" disabled={suggestedQuestions.length === 0}>
                Suggested Questions {suggestedQuestions.length === 0 && '(Not Available)'}
              </SelectItem>
            </SelectContent>
          </Select>

          {questionType === 'normal' && (
            <div className="mb-4">
              <Label className="mb-2 block">Select Chapters</Label>
              {getChapters().map(chapter => (
                <div key={chapter} className="flex items-center mb-2">
                  <Checkbox
                    id={`chapter-${chapter}`}
                    checked={selectedChapters.includes(chapter)}
                    onCheckedChange={() => handleChapterChange(chapter)}
                  />
                  <Label htmlFor={`chapter-${chapter}`} className="ml-2">
                    {chapter}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {questionType === 'suggested' && (
            <Select 
              onValueChange={(value) => setSelectedExamType(value)} 
              disabled={!selectedSubject}
            >
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exam Types</SelectItem>
                {getExamTypes().map(examType => (
                  <SelectItem key={examType} value={examType}>{examType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Input
            type="number"
            value={numberOfQuestions}
            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
            min="5"
            max="50"
            className="mb-4"
            placeholder="Number of questions"
            disabled={!selectedSubject}
          />

          <Button 
            onClick={() => setExamStarted(true)} 
            disabled={!selectedSubject || !questionType || (questionType === 'normal' && selectedChapters.length === 0)}
          >
            Start Exam
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = examQuestions[currentQuestion];

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1} of {examQuestions.length}</CardTitle>
        </CardHeader>
        <CardContent>
          {question ? (
            <>
              <p className="text-lg mb-4">{question.question}</p>
              {questionType === 'normal' && (
                <p className="text-sm text-gray-500 mb-2">Chapter: {question.chapter}</p>
              )}
              {questionType === 'suggested' && (
                <p className="text-sm text-gray-500 mb-2">Exam Type: {question.exam_type}</p>
              )}
              <RadioGroup
                value={selectedAnswers[question.id] || ''}
                onValueChange={(value) => handleAnswerSelect(question.id, value)}
              >
                {renderAvailableOptions(question)}
              </RadioGroup>
              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setShowExitConfirmation(true)}
                  variant="outline"
                >
                  Exit Exam
                </Button>
                {currentQuestion === examQuestions.length - 1 ? (
                  <Button onClick={handleFinishExam}>Finish Exam</Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={examMode === 'one-way' && currentQuestion > 0}
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
    </>
  );
}

export default ExamApp;
