import React from 'react';
import Link from 'next/link';
import { PiGraduationCapDuotone } from "react-icons/pi";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <PiGraduationCapDuotone className="text-6xl text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-800">Exam Application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 p-6">
          <Link href="/exam" >
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Start Exam
            </Button>
          </Link>
          <Link href="/feedback" >
            <Button variant="outline" className="w-full border-blue-300 text-blue-600 font-semibold py-3 rounded-lg transition duration-300 ease-in-out hover:bg-blue-50">
            Give Us Feedback
            </Button>
          </Link>
          <Link href="/contribute" >
            <Button variant="outline" className="w-full border-blue-300 text-blue-600 font-semibold py-3 rounded-lg transition duration-300 ease-in-out hover:bg-blue-50">
            Help Us Insert Question
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;