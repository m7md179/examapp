
'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const QuestionInsertionForm = ({ subjects }) => {
  const [questionType, setQuestionType] = useState('normal');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('');
  const [chapter, setChapter] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = createClientComponentClient();

    const questionData = {
      question,
      option_1: options[0],
      option_2: options[1],
      option_3: options[2],
      option_4: options[3],
      correct_answer: correctAnswer,
      subject_id: parseInt(subjectId),
      ...(questionType === 'suggested' ? { exam_type: examType } : { chapter }),
    };

    try {
      const { data, error } = await supabase
        .from('user_submitted_questions')
        .insert([{ ...questionData, question_type: questionType }]);

      if (error) throw error;
      alert('Question submitted successfully!');
      // Reset form
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setSubjectId('');
      setExamType('');
      setChapter('');
    } catch (error) {
      console.error('Error inserting question:', error);
      alert('Failed to submit question. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Submit a New Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label>Question Type</Label>
            <RadioGroup value={questionType} onValueChange={setQuestionType} className="flex space-x-4">
              <div className="flex items-center">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="ml-2">Normal</Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="suggested" id="suggested" />
                <Label htmlFor="suggested" className="ml-2">Suggested</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label htmlFor="question">Question</Label>
            <Input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
          </div>

          {options.map((option, index) => (
            <div key={index} className="mb-4">
              <Label htmlFor={`option-${index + 1}`}>Option {index + 1}</Label>
              <Input
                id={`option-${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                required
              />
            </div>
          ))}

          <div className="mb-4">
            <Label htmlFor="correct-answer">Correct Answer</Label>
            <Input id="correct-answer" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} required />
          </div>

          <div className="mb-4">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {questionType === 'suggested' ? (
            <div className="mb-4">
              <Label htmlFor="exam-type">Exam Type</Label>
              <Input id="exam-type" value={examType} onChange={(e) => setExamType(e.target.value)} required />
            </div>
          ) : (
            <div className="mb-4">
              <Label htmlFor="chapter">Chapter</Label>
              <Input id="chapter" value={chapter} onChange={(e) => setChapter(e.target.value)} required />
            </div>
          )}

          <Button type="submit" className="w-full">Submit Question</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionInsertionForm;