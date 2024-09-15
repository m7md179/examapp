'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [majorId, setMajorId] = useState('');
  const [majors, setMajors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMajors = async () => {
      const { data, error } = await supabase.from('majors').select('*');
      if (error) {
        console.error('Error fetching majors:', error);
      } else {
        setMajors(data);
      }
    };

    fetchMajors();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    if (authData.user) {
      const { error: insertError } = await supabase.from('students').insert({
        id: authData.user.id,
        name,
        email,
        major_id: parseInt(majorId),
      });

      if (insertError) {
        setError(insertError.message);
        // You might want to delete the auth user here if the student insert fails
      } else {
        router.push('/dashboard'); // Redirect to dashboard or exam page
      }
    }

    setIsLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard'); // Redirect to dashboard or exam page
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Login or Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="major">Major</Label>
              <Select onValueChange={setMajorId} value={majorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your major" />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major.id} value={major.id.toString()}>
                      {major.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Sign Up'}
            </Button>
          </div>
        </form>
        <div className="mt-4">
          <Button onClick={handleSignIn} variant="outline" disabled={isLoading}>
            Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;