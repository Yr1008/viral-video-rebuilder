import { NextRequest } from 'next/server';
export async function POST(req:NextRequest){
  const { url } = await req.json();
  if(!url) return new Response(JSON.stringify({error:'missing url'}),{status:400});
  try{
    const u=new URL(url);
    if(u.host.includes('youtube')||u.host.includes('youtu.be')){
      const id = u.searchParams.get('v') || (u.pathname.split('/').pop()||'');
      return Response.json({ platform:'youtube', embed:`https://www.youtube.com/embed/${id}` });
    }
    if(u.host.includes('tiktok.com')) return Response.json({ platform:'tiktok', embed:url });
    if(u.host.includes('instagram.com')) return Response.json({ platform:'instagram', embed:url });
    return Response.json({ platform:'unknown', embed:url });
  }catch(e:any){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}