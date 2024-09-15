import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <Link href="/exam">Go to Exam</Link>
    </div>
  );
}