import { NextRequest } from 'next/server';
export async function POST(req:NextRequest){
  const { script } = await req.json();
  if(!script) return new Response(JSON.stringify({error:'missing script'}),{status:400});
  const lines = script.split(/\n+/).filter(Boolean);
  const total = Math.max(9, Math.min(15, lines.length*2.2));
  const seg = total / lines.length;
  const beats = lines.map((line:string,i:number)=>({ start: +(i*seg).toFixed(2), end: +((i+1)*seg).toFixed(2), text: line.replace(/^[-*•\s]+/,'') }));
  return Response.json({ duration: total, beats });
}