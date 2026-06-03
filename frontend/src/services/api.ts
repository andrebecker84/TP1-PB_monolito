export async function ok<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || r.statusText);
  if (r.status === 204) return undefined as T;
  return r.json();
}
