import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Message } from '@/lib/db/schema';

export async function POST(req: Request) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { chatId } = await req.json();
	if (typeof chatId !== 'number') {
		return NextResponse.json({ error: 'Invalid chatId' }, { status: 400 });
	}

	const messages = await db
		.select()
		.from(Message)
		.where(eq(Message.chatId, chatId));

	return NextResponse.json(messages);
}
