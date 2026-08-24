import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader || '' } } }
  );

  try {
    const { name, tag, userId, discordName, avatarUrl, tier } = await request.json();

    if (!name || !tag || !userId) {
      return NextResponse.json({ error: '닉네임과 태그를 모두 입력해주세요.' }, { status: 400 });
    }

    // 1. 공식 Riot API를 통해 계정 존재 여부 확인 (PUUID 조회)
    const riotToken = process.env.RIOT_API_KEY;
    if (!riotToken) {
      return NextResponse.json({ error: 'RIOT_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const res = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, {
      headers: {
        'X-Riot-Token': riotToken
      }
    });
    
    if (!res.ok) {
      const data = await res.json();
      console.error('Riot API Error:', res.status, data);
      return NextResponse.json({ error: '라이엇 계정을 찾을 수 없습니다. 닉네임과 태그를 다시 확인해주세요.' }, { status: 404 });
    }

    const finalTier = tier || 'Unranked';

    // 2. Supabase profiles 테이블에 저장 (upsert)
    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        discord_name: discordName,
        avatar_url: avatarUrl,
        riot_id: `${name}#${tag}`,
        valorant_tier: finalTier,
      });

    if (dbError) {
      console.error('DB Error:', dbError);
      return NextResponse.json({ error: `데이터베이스 저장 실패: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, tier: finalTier });
  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
