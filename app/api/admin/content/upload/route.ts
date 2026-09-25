import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

const bucket = 'probetech-content';
const maxBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

async function hasMatchingImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (file.type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === 'image/png') return bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  if (file.type === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (file.type === 'image/avif') return String.fromCharCode(...bytes.slice(4, 12)).startsWith('ftypavif');
  return false;
}

export async function POST(request: Request) {
  const context = await getAuthContext();
  if (!context || context.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const file = form.get('file');
  const alt = String(form.get('alt') ?? '').trim();
  const originalName = String(form.get('name') ?? 'image');
  if (!(file instanceof File) || !alt) return NextResponse.json({ error: 'Choose an image and provide alt text.' }, { status: 400 });
  if (!allowedTypes.has(file.type) || file.size > maxBytes || file.size === 0) return NextResponse.json({ error: 'Use a JPG, PNG, WebP, or AVIF image up to 5 MB.' }, { status: 400 });
  if (!(await hasMatchingImageSignature(file))) return NextResponse.json({ error: 'The file contents do not match a supported image type.' }, { status: 400 });
  const safeName = originalName.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'image';
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const path = `${context.user.id}/${crypto.randomUUID()}-${safeName}.${ext}`;
  const storage = await createServiceRoleSupabaseClient();
  if (!storage) return NextResponse.json({ error: 'Image uploads are not configured. Set SUPABASE_SERVICE_ROLE_KEY on the server.' }, { status: 503 });

  const { error: bucketError } = await storage.storage.createBucket(bucket, { public: true, fileSizeLimit: maxBytes, allowedMimeTypes: [...allowedTypes] });
  if (bucketError && !/already exists/i.test(bucketError.message)) return NextResponse.json({ error: `Could not prepare image storage: ${bucketError.message}` }, { status: 500 });
  const { error: uploadError } = await storage.storage.from(bucket).upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (uploadError) return NextResponse.json({ error: `Image upload failed: ${uploadError.message}` }, { status: 500 });
  const { data } = storage.storage.from(bucket).getPublicUrl(path);
  const markedUrl = `${data.publicUrl}#alt=${encodeURIComponent(alt)}`;
  return NextResponse.json({ url: markedUrl });
}
