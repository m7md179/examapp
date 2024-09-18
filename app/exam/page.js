// app/exam/page.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ExamApp from '../../components/ExamApp'
import { redirect } from 'next/navigation'

export default async function ExamPage() {
  const supabase = createServerComponentClient({ cookies })
  

  const { data: majors } = await supabase.from('majors').select('*')
  const { data: subjectTypes } = await supabase.from('subject_types').select('*')
  const { data: subjects } = await supabase.from('subjects').select('*')
  const { data: suggestedQuestions } = await supabase.from('suggested_questions').select('*')
  const { data: questions } = await supabase.from('questions').select('*')

  if (!majors || !subjectTypes || !subjects || !questions || !suggestedQuestions) {
    return <div>Error loading data. Please try again later.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Application</h1>
      <ExamApp
        majors={majors}
        subjectTypes={subjectTypes}
        subjects={subjects}
        questions={questions}
        suggestedQuestions={suggestedQuestions}
      />
    </div>
  )
}