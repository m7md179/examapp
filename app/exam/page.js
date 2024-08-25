// app/exam/page.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ExamApp from '../../components/ExamApp'

export default async function ExamPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: questions, error } = await supabase
    .from('exam_questions')
    .select('*')

  if (error) {
    console.error("Error fetching questions:", error)
    return <div>Error loading questions. Please try again later.</div>
  }

  if (!questions || questions.length === 0) {
    return <div>No questions found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Application</h1>
      <ExamApp questions={questions} />
    </div>
  )
}