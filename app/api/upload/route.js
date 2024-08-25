// app/api/upload/route.js
import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = path.join(process.cwd(), 'public', 'uploaded_exam.csv');
  await writeFile(filePath, buffer);

  return NextResponse.json({ success: true });
}