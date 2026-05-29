import { NextRequest, NextResponse } from 'next/server';
import { getRandomLocation } from '@/lib/locations';

export function GET(request: NextRequest): NextResponse {
  const excludeParam = request.nextUrl.searchParams.get('exclude');
  const excludeIds = excludeParam
    ? excludeParam.split(',').filter(Boolean)
    : [];

  try {
    const location = getRandomLocation(excludeIds);
    return NextResponse.json(location);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load coordinates', code: 'COORDS_NOT_LOADED' },
      { status: 500 },
    );
  }
}
