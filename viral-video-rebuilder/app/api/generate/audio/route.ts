import { NextRequest } from 'next/server';
import fs from 'node:fs';
import { OpenAI } from 'openai';
export const dynamic = 'force-dynamic';
export async function POST(req:NextRequest){
  const { text, voice="alloy" } = await req.json();
  if(!text) return new Response(JSON.stringify({error:'missing text'}),{status:400});
  try{
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const speech = await openai.audio.speech.create({ model: 'gpt-4o-mini-tts', voice, input: text });
    const buf = Buffer.from(await speech.arrayBuffer());
    const p = `/tmp/vo_${Date.now()}.mp3`; 
    fs.writeFileSync(p, buf);
    return Response.json({ url: `/api/file?f=${encodeURIComponent(p)}` });
  }catch(e:any){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}