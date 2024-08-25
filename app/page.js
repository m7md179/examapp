// app/page.js
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Exam Application</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/exam">
            <Button>Start Exam</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}