'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	MessageCircle,
	PlusCircle,
} from 'lucide-react';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import type { DrizzleChat } from '@/lib/db/schema';

type Props = {
	chats: DrizzleChat[];
	chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
	const [loading, setLoading] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	const handleNewChat = () => {
		setLoading(true);
		setTimeout(() => setLoading(false), 1000);
	};

	return (
		<aside
			className={cn(
				'h-screen bg-black text-white flex flex-col transition-all duration-300 relative overflow-hidden border-r border-white/20',
				isCollapsed ? 'w-16' : 'w-full max-w-xs'
			)}
			aria-label='Chat navigation sidebar'>
			<button
				onClick={() => setIsCollapsed((c) => !c)}
				className='absolute top-4 right-4 z-20 p-2 bg-black/80 border border-white/20 rounded-md hover:bg-white/10 transition-all duration-200'
				aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
				{isCollapsed ? (
					<ChevronRight className='w-4 h-4' />
				) : (
					<ChevronLeft className='w-4 h-4' />
				)}
			</button>

			{!isCollapsed && (
				<Link href='/' onClick={handleNewChat}>
					<Button
						className='m-4 w-[calc(100%-2rem)] bg-black hover:bg-white/10 text-white border border-white/20 rounded-md font-bold tracking-wide shadow-md hover:shadow-white/20 transition-all duration-300'
						disabled={loading}>
						{loading ? (
							<Loader2 className='w-5 h-5 animate-spin' />
						) : (
							<>
								<PlusCircle className='w-5 h-5 mr-2' />
								New chat
							</>
						)}
					</Button>
				</Link>
			)}

			<nav
				className={cn(
					'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent',
					isCollapsed ? 'p-2 space-y-2' : 'p-4 pt-0 space-y-2'
				)}
				aria-label='Chat list'>
				{isCollapsed ? (
					chats.map((chat) => (
						<Link key={chat.id} href={`/chat/${chat.id}`} title={chat.pdfName}>
							<div
								className={cn(
									'p-2 rounded-md flex justify-center items-center transition-all duration-200',
									{
										'bg-white/20 border-white/30': chat.id === chatId,
										'hover:bg-white/10': chat.id !== chatId,
									}
								)}>
								<MessageCircle className='w-5 h-5 text-white' />
							</div>
						</Link>
					))
				) : chats.length === 0 ? (
					<p className='text-sm text-gray-400 text-center mt-6 font-medium'>
						No chats yet — upload a PDF to begin.
					</p>
				) : (
					chats.map((chat) => (
						<Link key={chat.id} href={`/chat/${chat.id}`}>
							<div
								className={cn(
									'flex items-center gap-3 p-3 rounded-md border border-white/20 transition-all duration-200',
									{
										'bg-white/20 shadow-md': chat.id === chatId,
										'hover:bg-white/10 hover:shadow-sm': chat.id !== chatId,
									}
								)}>
								<MessageCircle className='w-5 h-5 text-white' />
								<p className='text-sm font-medium text-white truncate'>
									{chat.pdfName}
								</p>
							</div>
						</Link>
					))
				)}
			</nav>
		</aside>
	);
};

export default ChatSideBar;
