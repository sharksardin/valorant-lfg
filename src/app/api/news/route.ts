import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HENRIK_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 HENRIK_API_KEY가 설정되지 않았습니다." }, 
      { status: 401 }
    );
  }

  try {
    const res = await fetch("https://api.henrikdev.xyz/valorant/v1/website/ko-kr", {
      headers: {
        "Authorization": apiKey
      },
      // API 호출 횟수를 아끼기 위해 Vercel 서버에 1시간(3600초) 동안 결과를 캐싱해둠
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      throw new Error(`Henrik API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("News API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
