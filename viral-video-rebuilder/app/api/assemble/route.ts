import { NextRequest } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'node:fs';
// @ts-ignore
(ffmpeg as any).setFfmpegPath(ffmpegPath as any);
export const dynamic = 'force-dynamic';
function toSrt(beats:any[]){
  const f = (s:number)=>{
    const h=Math.floor(s/3600).toString().padStart(2,'0');
    const m=Math.floor((s%3600)/60).toString().padStart(2,'0');
    const sec=(s%60).toFixed(3).padStart(6,'0');
    return `${h}:${m}:${sec.replace('.',',')}`;
  };
  return beats.map((b,i)=>`${i+1}\n${f(b.start)} --> ${f(b.end)}\n${b.text}\n`).join('\n');
}
export async function POST(req:NextRequest){
  const { assets, analysis, audioUrl } = await req.json();
  const imageUrls:string[] = assets?.images?.map((x:any)=>x.url) || [];
  const beats:any[] = analysis?.beats || [];
  if(!imageUrls.length || !beats.length || !audioUrl) return new Response(JSON.stringify({error:'images, beats and audioUrl required'}),{status:400});
  const out = `/tmp/render_${Date.now()}.mp4`;
  const srtPath = `/tmp/captions_${Date.now()}.srt`;
  fs.writeFileSync(srtPath, toSrt(beats));
  try{
    const localImgs:string[] = [];
    for (const [i,u] of imageUrls.entries()){
      const b = await fetch(u); const buf = Buffer.from(await b.arrayBuffer());
      const p = `/tmp/img_${i}_${Date.now()}.png`; fs.writeFileSync(p, buf); localImgs.push(p);
    }
    await new Promise((resolve,reject)=>{
      const cmd = (ffmpeg as any)();
      localImgs.forEach((p,idx)=>cmd.input(p).inputOptions(['-loop 1', `-t ${Math.max(1, (beats[idx]?.end - beats[idx]?.start)||2)}`]));
      cmd.input(audioUrl)
        .complexFilter([
          '[0:v]scale=1080:1920,setsar=1[v0]',
          ...(localImgs.slice(1).map((_,idx)=>`[${idx+1}:v]scale=1080:1920,setsar=1[v${idx+1}]`)),
          `${localImgs.map((_,idx)=>`[v${idx}]`).join('')}concat=n=${localImgs.length}:v=1:a=0,format=yuv420p[vid]`
        ])
        .map('[vid]')
        .videoFilter(`subtitles=${srtPath}:force_style='Fontsize=28,Outline=1,MarginV=80'`)
        .outputOptions(['-r 30'])
        .on('end', resolve)
        .on('error', reject)
        .save(out);
    });
    return Response.json({ renderUrl: `/api/renders?f=${encodeURIComponent(out)}` });
  }catch(e:any){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}