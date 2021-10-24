export const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function randomInteger (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomCharacter (): string {
  return alphabet.charAt(randomInteger(0, alphabet.length - 1))
}

export function randomString (length: number): string {
  return Array.from({ length })
    .map(randomCharacter)
    .join('')
}
