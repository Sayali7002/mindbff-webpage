import { NextRequest, NextResponse } from 'next/server';
import { sendResendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body } = await request.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await sendResendEmail(to, subject, body);
    return NextResponse.json({ message: 'Email sent' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}