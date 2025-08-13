import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';
export async function POST(req:NextRequest){
  const { sourceTranscript, rewrittenScript } = await req.json();
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const a = (await openai.embeddings.create({ model:'text-embedding-3-small', input: sourceTranscript||'' })).data[0].embedding;
  const b = (await openai.embeddings.create({ model:'text-embedding-3-small', input: rewrittenScript||'' })).data[0].embedding;
  const dot = a.reduce((s:number,v:number,i:number)=>s+v*b[i],0);
  const magA = Math.sqrt(a.reduce((s:number,v:number)=>s+v*v,0));
  const magB = Math.sqrt(b.reduce((s:number,v:number)=>s+v*v,0));
  const sim = dot/(magA*magB+1e-9);
  const score = Math.max(0, 1 - sim);
  return Response.json({ score });
}