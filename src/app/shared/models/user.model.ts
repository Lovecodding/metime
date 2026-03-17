export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  password?: string; // Optional, for demo purposes only (never store plain passwords in production!)
}
