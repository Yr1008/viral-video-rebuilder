import { NextRequest } from 'next/server';
import ytdl from 'ytdl-core';
import fs from 'node:fs';
import { OpenAI } from 'openai';
export const dynamic = 'force-dynamic';
export async function POST(req:NextRequest){
  const { url } = await req.json();
  if(!url) return new Response(JSON.stringify({error:'missing url'}),{status:400});
  const u = new URL(url);
  const tmp = `/tmp/yt_${Date.now()}.mp3`;
  try{
    if(u.host.includes('youtube')||u.host.includes('youtu.be')){
      await new Promise((resolve,reject)=>{
        ytdl(url,{quality:'highestaudio'})
          .pipe(fs.createWriteStream(tmp))
          .on('finish',resolve)
          .on('error',reject);
      });
    } else {
      return new Response(JSON.stringify({error:'Transcription currently supports YouTube links here. For TikTok use /api/transcribe/tiktok'}),{status:501});
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const tr = await openai.audio.transcriptions.create({ model:'whisper-1', file: fs.createReadStream(tmp) as any });
    try{ fs.unlinkSync(tmp); }catch{}
    return Response.json({ text: tr.text });
  }catch(e:any){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}