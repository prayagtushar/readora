import {
	pgTable,
	serial,
	timestamp,
	text,
	varchar,
	integer,
	pgEnum,
} from 'drizzle-orm/pg-core';

export const Chat = pgTable('chat', {
	id: serial('id').primaryKey(),
	userId: varchar('user_id', { length: 256 }).notNull(),
	pdfName: text('pdf_name').notNull(),
	pdfUrl: text('pdf_url').notNull(),
	fileKey: text('file_key').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
export type DrizzleChat = typeof Chat.$inferSelect;

export const messageRole = pgEnum('message_role', ['user', 'assistant']);

export const Message = pgTable('message', {
	id: serial('id').primaryKey(),
	chatId: integer('chat_id')
		.references(() => Chat.id)
		.notNull(),
	role: messageRole('role').notNull(),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
