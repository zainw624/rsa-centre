import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { fetchGuildMember, fetchGuildRoles, mapDiscordRoles, resolvePermission } from '@/lib/discord';

const botOwnerId = process.env.BOT_OWNER_ID;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope: 'identify email'
        }
      }
    })
  ],
  session: {
    strategy: 'database'
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile || !user) {
        return '/login';
      }

      const discordProfile = profile as any;
      const member = await fetchGuildMember(discordProfile.id as string);
      if (!member) {
        return '/access-denied';
      }

      const roleMap = await fetchGuildRoles();
      const roleNames = mapDiscordRoles(member.roles ?? [], roleMap);
      const permission = resolvePermission(roleNames, botOwnerId, discordProfile.id as string);
      const avatarUrl = discordProfile.avatar
        ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
        : null;

      await prisma.user.upsert({
        where: { discordId: discordProfile.id as string },
        update: {
          name: discordProfile.username as string,
          email: discordProfile.email as string | null,
          image: avatarUrl,
          roles: roleNames,
          permission
        },
        create: {
          discordId: discordProfile.id as string,
          name: discordProfile.username as string,
          email: discordProfile.email as string | null,
          image: avatarUrl,
          roles: roleNames,
          permission
        }
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.discordId = (user as any).discordId ?? token.discordId;
        token.roles = (user as any).roles ?? [];
        token.permission = (user as any).permission ?? 'viewer';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.discordId = token.discordId as string;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.permission = (token.permission as string) ?? 'viewer';
      }
      return session;
    }
  }
};
