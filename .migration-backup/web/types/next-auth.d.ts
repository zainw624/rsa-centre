import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      discordId: string;
      permission: string;
      roles: string[];
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    discordId: string;
    roles: string[];
    permission: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    discordId: string;
    roles: string[];
    permission: string;
  }
}
