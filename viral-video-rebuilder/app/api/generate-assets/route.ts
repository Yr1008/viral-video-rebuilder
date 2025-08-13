import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';
export async function POST(req:NextRequest){
  const { script } = await req.json();
  if(!script) return new Response(JSON.stringify({error:'missing script'}),{status:400});
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompts = [
    'Bold pattern-interrupt background, high-contrast, clean typography placeholder',
    'Soft b-roll style image of hands using a phone, minimalistic, depth of field',
    'End-card CTA background, subtle gradient, space for large text'
  ];
  const images:string[] = [];
  for(const p of prompts){
    const out = await openai.images.generate({ model:'gpt-image-1', prompt:p, size:'1024x1024' });
    images.push(out.data[0].url!);
  }
  const assets = { images: images.map((url,i)=>({ id:`img${i+1}`, url })), clips: [], music: [], voice: [] };
  return Response.json(assets);
}