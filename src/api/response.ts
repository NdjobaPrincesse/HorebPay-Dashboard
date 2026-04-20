const COLLECTION_KEYS = [
  'content',
  'data',
  'results',
  'items',
  'rows',
  'transactions',
  'clients',
  'enterprises',
  'records',
  'docs',
  'list',
  'payload',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const looksLikeCollection = (value: unknown): value is unknown[] => Array.isArray(value);

const findCollection = (payload: unknown, visited = new Set<object>()): unknown[] => {
  if (looksLikeCollection(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (visited.has(payload)) {
    return [];
  }
  visited.add(payload);

  for (const key of COLLECTION_KEYS) {
    const value = payload[key];

    if (looksLikeCollection(value)) {
      return value;
    }
  }

  for (const key of COLLECTION_KEYS) {
    const value = payload[key];

    if (isRecord(value)) {
      const nestedCollection = findCollection(value, visited);
      if (nestedCollection.length > 0) {
        return nestedCollection;
      }
    }
  }

  for (const value of Object.values(payload)) {
    if (isRecord(value)) {
      const nestedCollection = findCollection(value, visited);
      if (nestedCollection.length > 0) {
        return nestedCollection;
      }
    }
  }

  return [];
};

export const extractCollection = <T>(payload: unknown): T[] => {
  return findCollection(payload) as T[];
};
