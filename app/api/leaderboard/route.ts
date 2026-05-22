import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

// Simple in-memory fallback for local development if Redis/KV is not configured
let localLeaderboardFallback: any[] = [];

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const isRedisConfigured = () => {
  return !!redisUrl && !!redisToken;
};

// Initialize the Redis client only if configured
const redis = isRedisConfigured()
  ? new Redis({
      url: redisUrl as string,
      token: redisToken as string,
    })
  : null;

export async function GET() {
  try {
    if (!isRedisConfigured() || !redis) {
      console.warn("Upstash Redis / Vercel KV is not configured. Falling back to in-memory leaderboard.");
      return NextResponse.json({ success: true, records: localLeaderboardFallback.slice(0, 25) });
    }

    const rawList = await redis.zrange('battleship_leaderboard', 0, 24);
    const records = rawList.map((item: any) => {
      try {
        return typeof item === 'string' ? JSON.parse(item) : item;
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    // Fall back gracefully to in-memory in case of DB read failures
    return NextResponse.json({ success: true, records: localLeaderboardFallback.slice(0, 25) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, turns, agent } = body;

    if (!name || typeof turns !== 'number' || !agent) {
      return NextResponse.json({ success: false, error: 'Invalid record data' }, { status: 400 });
    }

    const newRecord = {
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      name: name.slice(0, 16),
      turns,
      agent,
      date: new Date().toLocaleDateString(),
    };

    if (!isRedisConfigured() || !redis) {
      console.warn("Upstash Redis / Vercel KV is not configured. Storing highscore in-memory.");
      localLeaderboardFallback.push(newRecord);
      localLeaderboardFallback.sort((a, b) => a.turns - b.turns);
      localLeaderboardFallback = localLeaderboardFallback.slice(0, 100);
      return NextResponse.json({ success: true, record: newRecord });
    }

    await redis.zadd('battleship_leaderboard', {
      score: turns,
      member: JSON.stringify(newRecord),
    });

    // Cap the leaderboard to top 100 entries to save space/requests
    const totalCount = await redis.zcard('battleship_leaderboard');
    if (totalCount > 100) {
      await redis.zremrangebyrank('battleship_leaderboard', 100, -1);
    }

    return NextResponse.json({ success: true, record: newRecord });
  } catch (error: any) {
    console.error('Error saving highscore:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
