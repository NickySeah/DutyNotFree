export interface UserInformation {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date; // This is a Date object, not string
  emailVerified: boolean; // This is 0 or 1, not boolean
  image?: string | null;
  banned?: number;
  banExpires?: null | Date;
  banReason?: null | string;
  providerId?: string; // Add this new optional field
}