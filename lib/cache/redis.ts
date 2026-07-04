export async function getCache(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    const response = await fetch(`${url}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (e) {
    console.error('Redis cache get failed:', e);
    return null; // Fail gracefully
  }
}

export async function setCache(key: string, value: string, ttlDays = 30): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return;
  }

  try {
    const ttlSeconds = ttlDays * 24 * 60 * 60;
    await fetch(`${url}/set/${key}?ex=${ttlSeconds}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    });
  } catch (e) {
    console.error('Redis cache set failed:', e);
  }
}

export async function checkRateLimit(ip: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return true; // allow if cache not configured
  }

  const key = `ratelimit:${ip}`;
  const limit = 20; // 20 requests per minute
  
  try {
    // Increment counter
    const incRes = await fetch(`${url}/incr/${key}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const incData = await incRes.json();
    const count = incData.result;
    
    // Set expiry if first request
    if (count === 1) {
      await fetch(`${url}/expire/${key}/60`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    return count <= limit;
  } catch (e) {
    console.error('Rate limit check failed:', e);
    return true; // Fail open
  }
}
