// src/app/api/keepalive/route.ts
// Automated Keep-Alive Pinger to prevent Render free instance from sleeping

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const targetUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/system/status`
    : 'https://railsuraksha-ai.onrender.com/api/v1/system/status';

  try {
    const startTime = Date.now();
    const res = await fetch(targetUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'RailSuraksha-KeepAlive-Worker/1.0',
      },
    });

    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      status: 'ok',
      targetUrl,
      httpStatus: res.status,
      latencyMs: elapsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: 'error',
        targetUrl,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
