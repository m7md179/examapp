// pages/login.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import LoginPage from '@/components/LoginPage';

export default async function Login() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Redirect to dashboard or exam page if already logged in
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return <LoginPage />;
}