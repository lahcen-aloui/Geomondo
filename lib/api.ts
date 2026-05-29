import type {
  LocationResponse,
  ScorePayload,
  ScoreResponse,
} from '@/types/game';

/** Error thrown by API helpers that includes the HTTP status code. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getRandomLocationApi(
  excludeIds: string[] = [],
): Promise<LocationResponse> {
  const params = excludeIds.length > 0
    ? `?exclude=${excludeIds.join(',')}`
    : '';
  const res = await fetch(`/api/location${params}`);
  if (!res.ok) {
    throw new ApiError(`Failed to fetch location: ${res.status}`, res.status);
  }
  return res.json() as Promise<LocationResponse>;
}

export async function saveScoreApi(
  payload: ScorePayload,
): Promise<ScoreResponse> {
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      (body as { error?: string }).error ?? `Save score failed: ${res.status}`,
      res.status,
    );
  }
  return res.json() as Promise<ScoreResponse>;
}
