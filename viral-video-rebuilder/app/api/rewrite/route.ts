import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';
export async function POST(req:NextRequest){
  const { transcript, voice } = await req.json();
  if(!transcript) return new Response(JSON.stringify({error:'missing transcript'}),{status:400});
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const sys = `You rewrite scripts for short vertical videos. Keep it original, 9–12 seconds, crisp, emoji-free, with a curiosity hook and a question CTA.`;
  const user = `Voice: ${voice||'neutral'}\nOriginal transcript:\n${transcript}\n\nRewrite now as bullet lines: HOOK, BEAT1, BEAT2, CTA.`;
  const resp = await openai.chat.completions.create({ model:'gpt-4o-mini', messages:[{role:'system',content:sys},{role:'user',content:user}], temperature:0.7 });
  const script = resp.choices[0]?.message?.content||'';
  return Response.json({ script });
}