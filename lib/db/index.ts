import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

let _db: NeonHttpDatabase | null = null;

const getDb = (): NeonHttpDatabase => {
	if (_db) return _db;
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error('DATABASE_URL is not set in environment variables.');
	}
	_db = drizzle(neon(url));
	return _db;
};

export const db = new Proxy({} as NeonHttpDatabase, {
	get: (_target, prop) => Reflect.get(getDb(), prop, getDb()),
});
