'use client';

import { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { saveDemo } from '@/lib/demo/storage';

const DemoUploadButton = () => {
	const [busy, setBusy] = useState(false);
	const [stage, setStage] = useState<'idle' | 'uploading' | 'ingesting'>('idle');
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: { 'application/pdf': ['.pdf'] },
		maxFiles: 1,
		maxSize: 10 * 1024 * 1024,
		onDrop: async (accepted) => {
			const file = accepted[0];
			if (!file) return;

			try {
				setBusy(true);
				setError(null);

				const fileKey = `demo/${Date.now()}-${file.name
					.replace(/\s+/g, '-')
					.toLowerCase()}`;

				setStage('uploading');
				const blob = await upload(fileKey, file, {
					access: 'public',
					handleUploadUrl: '/api/upload?mode=demo',
					contentType: file.type || 'application/pdf',
				});

				setStage('ingesting');
				const res = await axios.post('/api/demo/ingest', {
					file_key: fileKey,
					url: blob.url,
				});
				if (!res.data?.ok) {
					throw new Error(res.data?.error || 'Ingestion failed');
				}

				saveDemo({
					fileKey,
					pdfUrl: blob.url,
					pdfName: file.name,
					messages: [],
				});

				toast.success('Ready — opening your demo chat');
				router.push('/demo/chat');
			} catch (err) {
				const msg = err instanceof Error ? err.message : 'Demo setup failed';
				toast.error(msg);
				setError(msg);
			} finally {
				setBusy(false);
				setStage('idle');
			}
		},
		onDropRejected: (rejected) => {
			const errs = rejected[0]?.errors ?? [];
			const msg = errs.some((e) => e.code === 'file-too-large')
				? 'File exceeds 10MB size limit'
				: errs.some((e) => e.code === 'file-invalid-type')
				? 'Only PDF files are accepted'
				: 'File must be a PDF and under 10MB';
			toast.error(msg);
			setError(msg);
		},
	});

	const label =
		stage === 'uploading'
			? 'Uploading…'
			: stage === 'ingesting'
			? 'Indexing PDF (chunking + embedding)…'
			: isDragActive
			? 'Drop PDF here'
			: 'Drag and drop a PDF, or click to upload';

	return (
		<div className='flex flex-col items-center justify-center w-full max-w-md gap-4'>
			<div
				{...getRootProps()}
				className={`flex flex-col items-center justify-center w-full h-52 p-5 rounded-xl border-2 border-dashed transition-all duration-200 ${
					busy
						? 'border-blue-500/50 bg-blue-500/10 animate-pulse cursor-wait'
						: 'bg-gray-800/20 border-gray-600/50 hover:border-gray-400/40'
				}`}>
				<input {...getInputProps()} disabled={busy} />
				{busy ? (
					<Loader2 className='h-8 w-8 text-blue-400 animate-spin mb-2' />
				) : (
					<Upload className='h-8 w-8 text-gray-400 mb-2' />
				)}
				<p className='text-sm sm:text-base text-gray-300 text-center'>{label}</p>
				<p className='text-xs text-gray-500 mt-1'>Max size: 10MB (PDF only)</p>
			</div>

			{error && (
				<p className='text-sm text-red-400 text-center max-w-xs'>{error}</p>
			)}
		</div>
	);
};

export default DemoUploadButton;
