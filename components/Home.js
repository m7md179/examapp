import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Exam Application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/exam" passHref>
            <Button className="w-full">Start Exam</Button>
          </Link>
          <Link href="/feedback" passHref>
            <Button className="w-full">Give Us Feedback</Button>
          </Link>
          <Link href="/contribute" passHref>
            <Button className="w-full">Help Us Insert Questions</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;