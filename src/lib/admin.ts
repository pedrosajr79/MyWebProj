const OWNER_EMAIL = "pedrosajr@gmail.com";

export function isOwner(email: string | undefined): boolean {
  return email === OWNER_EMAIL;
}
