interface OverwrittenRequestInit extends Omit<RequestInit, 'body'> {
  body: Record<string, any>;
}

export const enhancedFetch = async <T = any>(
  url: string,
  init?: OverwrittenRequestInit,
) => {
  const response = await fetch(url, {
    method: init?.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...(init?.body ? {body: JSON.stringify(init.body)} : {}),
  });

  if (!response.ok) {
    throw Object.assign(new Error(response.statusText), {
      statusCode: response.status,
    });
  }

  return response.json() as Promise<T>;
};
