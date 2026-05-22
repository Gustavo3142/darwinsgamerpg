let lastId = 0;

export function generateUniqueId(): number {
  const now = Date.now();
  if (now <= lastId) {
    lastId = lastId + 1;
  } else {
    lastId = now;
  }
  return lastId;
}
