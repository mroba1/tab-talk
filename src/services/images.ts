// Deterministic mock photography for the prototype — same seed always resolves
// to the same image, so a merchant's photos stay stable across app restarts.
export function mockPhoto(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
