import { NextRequest } from 'next/server';
import fs from 'node:fs';
export async function GET(req:NextRequest){
  const { searchParams } = new URL(req.url);
  const f = searchParams.get('f');
  if(!f || !fs.existsSync(f)) return new Response('not found',{status:404});
  const data = fs.readFileSync(f);
  const ext = f.split('.').pop();
  const ct = ext==='mp3' ? 'audio/mpeg' : ext==='wav' ? 'audio/wav' : 'application/octet-stream';
  return new Response(data, { headers: { 'Content-Type': ct } });
}