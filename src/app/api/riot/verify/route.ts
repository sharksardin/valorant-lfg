import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: '인증 토큰이 없습니다.' }, { status: 401 });
  }

  // 1. 토큰 검증용 클라이언트 (유저 확인용)
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const token = authHeader.replace('Bearer ', '');
    // 보안 핵심: 클라이언트가 보낸 userId를 믿지 않고, 토큰을 해독해서 진짜 유저 ID를 알아냅니다.
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: '유효하지 않은 인증입니다.' }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: '서버 환경변수에 SUPABASE_SERVICE_ROLE_KEY가 없습니다.' }, { status: 500 });
    }

    // 2. 관리자용 클라이언트 (RLS 무시하고 DB 강제 업데이트용)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const trueUserId = user.id;
    const { name, tag, discordName, avatarUrl } = await request.json();

    if (!name || !tag) {
      return NextResponse.json({ error: '닉네임과 태그를 모두 입력해주세요.' }, { status: 400 });
    }

    // 3. Henrik API를 통해 계정 존재 여부 및 실제 티어(랭크) 확인
    const henrikKey = process.env.HENRIK_API_KEY;
    if (!henrikKey) {
      return NextResponse.json({ error: 'HENRIK_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const headers = { 'Authorization': henrikKey };

    let region = '';
    try {
      const accountRes = await fetch(`https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers });
      if (!accountRes.ok) {
        const errText = await accountRes.text();
        return NextResponse.json({ error: `Henrik API 에러 (${accountRes.status}): ${errText}` }, { status: 404 });
      }
      const accountData = await accountRes.json();
      region = accountData.data?.region;
    } catch (e: any) {
      return NextResponse.json({ error: `Henrik Account API 에러: ${e.message}` }, { status: 500 });
    }

    // 3-2. MMR (랭크) 정보 가져오기
    let finalTier = 'Unranked';
    if (region) {
      try {
        const mmrRes = await fetch(`https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, { headers });
        if (mmrRes.ok) {
          const mmrData = await mmrRes.json();
          if (mmrData.data && mmrData.data.currenttierpatched) {
            finalTier = mmrData.data.currenttierpatched;
          }
        }
      } catch (e: any) {
        console.error("MMR API Error:", e);
      }
    }

    // 4. Supabase profiles 테이블에 저장 (관리자 권한으로 강제 쓰기)
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: trueUserId, // 검증된 유저 ID만 사용!
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
