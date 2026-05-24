import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

import ChatLayout from '@/components/layouts/ChatLayout';
import { db } from '@/lib/db';
import { Chat } from '@/lib/db/schema';

export default async function ChatPage({
	params,
}: {
	params: Promise<{ chatId: string }>;
}) {
	const { chatId } = await params;
	const numericChatId = Number(chatId);
	if (!chatId || Number.isNaN(numericChatId)) {
		notFound();
	}

	const { userId } = await auth();
	if (!userId) redirect('/sign-in');

	const userChats = await db
		.select()
		.from(Chat)
		.where(eq(Chat.userId, userId))
		.orderBy(Chat.createdAt);

	if (!userChats.length) redirect('/');

	const currentChat = userChats.find((c) => c.id === numericChatId);
	if (!currentChat?.pdfUrl) notFound();

	return (
		<ChatLayout
			chats={userChats}
			chatId={numericChatId}
			currentChatPdfUrl={currentChat.pdfUrl}
			currentChatPdfName={currentChat.pdfName}
		/>
	);
}
