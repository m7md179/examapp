// app/exam/page.js
import ExamApp from '../../components/ExamApp';
import { supabase } from '../../lib/supabaseClient';

async function getQuestions() {
  try {
    console.log("Fetching questions from Supabase...");
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*');

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (data.length === 0) {
      console.warn("No questions found. Data:", data);
    } else {
      console.log("Fetched questions:", data);
    }

    return data || []; // Return an empty array if data is null or undefined
  } catch (error) {
    console.error("Error fetching questions:", error.message);
    return null;
  }
}

async function testFetch() {
  try {
    console.log("Starting test fetch...");
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    console.log("Test fetch data:", data);
  } catch (error) {
    console.error("Test fetch error:", error.message);
  }
}

export default async function ExamPage() {
  console.log("ExamPage component loaded.");
  
  const questions = await getQuestions();
  
  // Ensure that testFetch is called
  console.log("Calling testFetch...");
  await testFetch();
  
  if (questions === null) {
    console.log("Questions are null.");
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Exam Application</h1>
        <p className="text-center text-red-500">Error loading questions. Please check the console for more details.</p>
      </div>
    );
  }

  console.log("Rendering ExamApp component with questions:", questions);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Application</h1>
      <ExamApp questions={questions} />
    </div>
  );
}
