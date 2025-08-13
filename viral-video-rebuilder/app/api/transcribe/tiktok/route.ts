import { NextRequest } from 'next/server';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { OpenAI } from 'openai';
export const dynamic = 'force-dynamic';
async function getVideoSrc(url:string){
  const browser = await chromium.launch({ args: (process.env.CHROME_ARGS||'').split(' ').filter(Boolean), headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const vid = await page.$('video');
  const src = vid ? await vid.getAttribute('src') : null;
  await browser.close();
  return src || null;
}
export async function POST(req:NextRequest){
  const { url } = await req.json();
  if(!url) return new Response(JSON.stringify({error:'missing url'}),{status:400});
  try{
    const src = await getVideoSrc(url);
    if(!src) return new Response(JSON.stringify({error:'Could not resolve media src; try a different link or upload audio'}),{status:422});
    const res = await fetch(src);
    const buf = Buffer.from(await res.arrayBuffer());
    const tmp = `/tmp/tk_${Date.now()}.mp4`; fs.writeFileSync(tmp, buf);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const tr = await openai.audio.transcriptions.create({ model:'whisper-1', file: fs.createReadStream(tmp) as any });
    try{ fs.unlinkSync(tmp); }catch{}
    return Response.json({ text: tr.text });
  }catch(e:any){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}