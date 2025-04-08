import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response('Token is required', { status: 400 });
  }

  try {
    const fileData = await kv.get(`file:${token}`);
    
    if (!fileData) {
      return new Response('File not found', { status: 404 });
    }

    // Return the file data
    return new Response(JSON.stringify(fileData), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 