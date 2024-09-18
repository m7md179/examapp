'use client';
import QuestionInsertionForm from "@/components/QuestionInsertionForm";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function Page() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('subjects')
        .select('*');

      if (error) {
        console.error('Error fetching subjects:', error);
      } else {
        setSubjects(data);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <QuestionInsertionForm subjects={subjects} />;
}

