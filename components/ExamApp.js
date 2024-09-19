// components/ExamApp.js

'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { PiGraduationCapDuotone } from "react-icons/pi";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Progress } from '@/components/ui/progress';
import { Flag } from 'lucide-react';

const ExamApp = ({ majors, subjectTypes, subjects, questions, suggestedQuestions }) => {
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [isMandatory, setIsMandatory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [selectedSuggestedExamTypes, setSelectedSuggestedExamTypes] = useState([]);
  const [questionType, setQuestionType] = useState('normal');
  const [error, setError] = useState(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [examMode, setExamMode] = useState(null);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportedQuestionId, setReportedQuestionId] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [showFlaggedQuestions, setShowFlaggedQuestions] = useState(false);

  const filteredSubjects = subjects.filter(subject => 
    subject.major_id === selectedMajor && 
    subjectTypes.find(st => st.id === subject.subject_type_id)?.is_mandatory === isMandatory
  );

  const getShuffledQuestions = useCallback(() => {
    const questionPool = questionType === 'normal' ? questions : suggestedQuestions;

    if (!Array.isArray(questionPool) || questionPool.length === 0) {
      setError(`No ${questionType} questions available. Please try a different question type or contact the administrator.`);
      return [];
    }

    let filtered = questionPool.filter(question => question.subject_id === selectedSubject);

    if (questionType === 'normal' && selectedChapters.length > 0) {
      filtered = filtered.filter(question => selectedChapters.includes(question.chapter));
    }

    if (questionType === 'suggested' && selectedSuggestedExamTypes.length > 0) {
      filtered = filtered.filter(question => selectedSuggestedExamTypes.includes(question.exam_type));
    }

    if (filtered.length === 0) {
      setError(`No ${questionType} questions available for the selected criteria. Please try different options.`);
      return [];
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(numberOfQuestions, shuffled.length));
  }, [questionType, questions, suggestedQuestions, selectedSubject, selectedChapters, selectedSuggestedExamTypes, numberOfQuestions]);

  const goToFlaggedQuestion = (questionId) => {
    const index = examQuestions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestion(index);
      setShowFlaggedQuestions(false);
    }
  };

  const handleReportQuestion = async () => {
    setReportError(null);
    const supabase = createClientComponentClient();
    
    if (!reportType || !reportDescription || reportedQuestionId === null) {
      setReportError('Please provide a report type and description of the issue.');
      return;
    }

    let reportData = {
      report_type: reportType,
      description: reportDescription,
      question_type: questionType,
      created_at: new Date().toISOString()
    };

    if (questionType === 'normal') {
      reportData.question_id = reportedQuestionId;
    } else if (questionType === 'suggested') {
      reportData.suggested_question_id = reportedQuestionId;
    } else {
      setReportError('Invalid question type');
      return;
    }

    try {
      const { data, error } = await supabase.from('question_reports').insert(reportData);

      if (error) throw error;

      alert('Question reported successfully. Thank you for your feedback.');
      setShowReportDialog(false);
      setReportDescription('');
      setReportedQuestionId(null);
      setReportType('');
    } catch (error) {
      console.error('Error reporting question:', error);
      setReportError(`Error reporting question: ${error.message}`);
    }
  };

  const openReportDialog = (questionId) => {
    setReportedQuestionId(questionId);
    setShowReportDialog(true);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
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

  const canMoveToNextQuestion = () => {
    return examMode === 'two-way' || selectedAnswers[examQuestions[currentQuestion].id];
  };

  useEffect(() => {
    if (selectedSubject && questionType) {
      const shuffledQuestions = getShuffledQuestions();
      setExamQuestions(shuffledQuestions);
      setCurrentQuestion(0);
      if (shuffledQuestions.length > 0) {
        setError(null);
      }
    }
  }, [selectedSubject, numberOfQuestions, questionType, selectedChapters, selectedSuggestedExamTypes, getShuffledQuestions]);

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
  
  const handleSuggestedExamTypeChange = (examType) => {
    setSelectedSuggestedExamTypes(prev => 
      prev.includes(examType) 
        ? prev.filter(type => type !== examType)
        : [...prev, examType]
    );
  };

  const handleChapterChange = (chapter) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(ch => ch !== chapter)
        : [...prev, chapter]
    );
  };


  if (showResults) {
    const score = calculateScore();
    return (
      
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <PiGraduationCapDuotone className="text-6xl text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-800">Exam Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold mb-4">
              Your score: {score} out of {examQuestions.length}
            </p>
            <Progress value={(score / examQuestions.length) * 100} className="mb-6" />
            {examQuestions.map((question, index) => (
              <div key={question.id} className="mb-6 p-4 border rounded-lg bg-white">
                <p className="text-lg font-semibold mb-2">Question {index + 1}: {question.question}</p>
                <p className={`mb-1 ${selectedAnswers[question.id] === question.correct_answer ? 'text-green-600' : 'text-red-600'}`}>
                  Your answer: {selectedAnswers[question.id]}
                </p>
                <p className="text-green-600 mb-2">Correct answer: {question.correct_answer}</p>
                <Button 
                  onClick={() => openReportDialog(question.id)} 
                  variant="outline" 
                  size="sm"
                  className="mt-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Report Wrong Answer
                </Button>
              </div>
            ))}
            <Button onClick={() => {
              setShowResults(false);
              setExamStarted(false);
              setSelectedAnswers({});
              setCurrentQuestion(0);
            }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Start New Exam
            </Button>
          </CardContent>
        </Card>
      <AlertDialog open={showReportDialog} onOpenChange={(open) => {
  if (!open) {
    setReportDescription('');
    setReportedQuestionId(null);
    setReportError(null);
    setReportType('');
  }
  setShowReportDialog(open);
}}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Report Wrong Answer</AlertDialogTitle>
      <AlertDialogDescription>
        Please provide details about why the answer is wrong.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <Select onValueChange={(value) => setReportType(value)}>
      <SelectTrigger className="w-full mb-4">
        <SelectValue placeholder="Select issue type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
      </SelectContent>
    </Select>
    <Textarea
      placeholder="Describe why the answer is wrong"
      value={reportDescription}
      onChange={(e) => setReportDescription(e.target.value)}
      className="mb-4"
    />
    {reportError && <p className="text-red-500 mb-4">{reportError}</p>}
    <AlertDialogFooter>
      <AlertDialogCancel onClick={() => {
        setReportDescription('');
        setReportedQuestionId(null);
        setReportError(null);
        setReportType('');
      }}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleReportQuestion}>Submit Report</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <PiGraduationCapDuotone className="text-6xl text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-800">Select Exam Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <Select onValueChange={(value) => setExamMode(value)}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select Exam Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one-way">One-Way (Can't go back to previous questions)</SelectItem>
            <SelectItem value="two-way">Two-Way (Can review and change answers)</SelectItem>
          </SelectContent>
        </Select>
          
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
              setSelectedSuggestedExamTypes([]);
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
            <div className="mb-4">
              <Label className="mb-2 block">Select Exam Types</Label>
              {getExamTypes().map(examType => (
                <div key={examType} className="flex items-center mb-2">
                  <Checkbox
                    id={`examType-${examType}`}
                    checked={selectedSuggestedExamTypes.includes(examType)}
                    onCheckedChange={() => handleSuggestedExamTypeChange(examType)}
                  />
                  <Label htmlFor={`examType-${examType}`} className="ml-2">
                    {examType}
                  </Label>
                </div>
              ))}
            </div>
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
              disabled={!selectedSubject || !questionType || !examMode ||
                (questionType === 'normal' && selectedChapters.length === 0) ||
                (questionType === 'suggested' && selectedSuggestedExamTypes.length === 0)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showFlaggedQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center">
            <PiGraduationCapDuotone className="text-6xl text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-800">Flagged Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {flaggedQuestions.length > 0 ? (
              flaggedQuestions.map(questionId => {
                const question = examQuestions.find(q => q.id === questionId);
                return (
                  <Button
                    key={questionId}
                    onClick={() => goToFlaggedQuestion(questionId)}
                    className="w-full mb-2 text-left bg-white hover:bg-blue-50 text-blue-600 border border-blue-300"
                  >
                    {question.question.substring(0, 50)}...
                  </Button>
                );
              })
            ) : (
              <p className="text-center text-gray-600">No flagged questions.</p>
            )}
            <Button onClick={() => setShowFlaggedQuestions(false)} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Back to Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = examQuestions[currentQuestion];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg relative bg-gradient-to-b from-blue-100 to-white">
        <CardHeader className="text-center pb-0">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-4">
            Question {currentQuestion + 1} of {examQuestions.length}
          </CardTitle>
          <Progress value={(currentQuestion / examQuestions.length) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          {question ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg text-gray-800 flex-grow">{question.question}</p>
                <Button
                  onClick={() => openReportDialog(question.id)}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-100 ml-2 hidden sm:inline-flex"
                >
                  Report Question
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFlagQuestion(question.id)}
                className={`w-full mb-4 ${flaggedQuestions.includes(question.id) ? 'bg-yellow-100' : ''} border-blue-300 text-blue-600 hover:bg-blue-50`}
              >
                <Flag
                  className={`w-4 h-4 mr-2 ${
                    flaggedQuestions.includes(question.id) ? 'text-yellow-500' : 'text-gray-500'
                  }`}
                />
                Flag
              </Button>
              {questionType === 'normal' && (
                <p className="text-sm text-gray-500 mb-2">Chapter: {question.chapter}</p>
              )}
              {questionType === 'suggested' && (
                <p className="text-sm text-gray-500 mb-2">Exam Type: {question.exam_type}</p>
              )}
              <RadioGroup
                value={selectedAnswers[question.id] || ''}
                onValueChange={(value) => handleAnswerSelect(question.id, value)}
                className="space-y-2 mb-4"
              >
                {renderAvailableOptions(question)}
              </RadioGroup>
  
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={!selectedAnswers[question.id]}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Next
                </Button>
                {currentQuestion > 0 && (
                  <Button onClick={() => setCurrentQuestion(currentQuestion - 1)} variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                    Previous
                  </Button>
                )}
                <Button onClick={() => setShowFlaggedQuestions(true)} variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                  Review Flagged Questions
                </Button>
                <Button onClick={() => setShowExitConfirmation(true)} variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Exit Exam
                </Button>
              </div>
  
              <Button
                onClick={() => openReportDialog(question.id)}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-100 mt-4 w-full sm:hidden"
              >
                Report Question
              </Button>
            </>
          ) : (
            <p className="text-center text-gray-600">No questions available for the selected subject.</p>
          )}
        </CardContent>
      </Card>
  
      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-800">Are you sure you want to exit the exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">Your progress will be lost if you exit now.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-300 text-blue-600 hover:bg-blue-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setExamStarted(false);
                setShowExitConfirmation(false);
                setSelectedAnswers({});
                setCurrentQuestion(0);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Exit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  
      {/* Finish Exam Confirmation Dialog */}
      <AlertDialog open={showFinishConfirmation} onOpenChange={setShowFinishConfirmation}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-800">Are you sure you want to finish the exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">You won't be able to change your answers after finishing.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-300 text-blue-600 hover:bg-blue-50">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinishExam} className="bg-blue-600 hover:bg-blue-700 text-white">Finish Exam</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  
      {/* Report Question Dialog */}
      <AlertDialog
        open={showReportDialog}
        onOpenChange={(open) => {
          if (!open) {
            setReportDescription('');
            setReportedQuestionId(null);
            setReportError(null);
            setReportType('');
          }
          setShowReportDialog(open);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-800">Report Question</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Please select the type of issue and provide details about the problem with this question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select onValueChange={setReportType} value={reportType}>
            <SelectTrigger className="w-full mb-4 border-blue-300 text-blue-600 hover:border-blue-400">
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="question_wrong">The question is wrong</SelectItem>
              <SelectItem value="options_wrong">The options are wrong</SelectItem>
              <SelectItem value="no_correct_answer">There's no correct answer</SelectItem>
              <SelectItem value="other">Other issue</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Describe the issue with the question"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="mb-4 border-blue-300 text-blue-600 focus:border-blue-400"
          />
          {reportError && <p className="text-red-500 mb-4">{reportError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setReportDescription('');
                setReportedQuestionId(null);
                setReportError(null);
                setReportType('');
              }}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReportQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">Submit Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  
    
}  

export default ExamApp;