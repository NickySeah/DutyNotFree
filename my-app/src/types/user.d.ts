export interface UserInformation {
  id: string;
  name: string;
  email: string;
  role: string | undefined; // Allow undefined role
  createdAt: Date; // This is a Date object, not string
  emailVerified: number; // This is 0 or 1, not boolean
  image?: string;
  banned?: number;
  banExpires?: null | Date;
  banReason?: null | string;
  providerId?: string; // Add this new optional field
}