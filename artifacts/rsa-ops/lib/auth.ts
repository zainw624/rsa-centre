import DiscordProvider from 'next-auth/providers/discord';
import { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { fetchGuildMember, fetchGuildRoles, mapDiscordRoles, resolvePermission } from '@/lib/discord';

const botOwnerId = process.env.BOT_OWNER_ID;

export const authOptions: NextAuthOptions = {
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
    strategy: 'jwt'
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
      const memberRoles = (member.roles as string[] | undefined) ?? [];
      const roleNames = mapDiscordRoles(memberRoles, roleMap);
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

    async jwt({ token, profile }) {
      // On initial sign-in the Discord profile is present; afterwards reload the
      // user's roles + permission from the DB on every request so that demotions
      // (via Discord sync) take effect promptly instead of persisting in a stale
      // JWT until it expires. This prevents privilege escalation after a role is
      // removed. The OAuth `user` object does NOT carry these fields.
      const discordId = (profile as any)?.id ?? (token.discordId as string | undefined);
      if (discordId) {
        const dbUser = await prisma.user.findUnique({ where: { discordId } });
        if (dbUser) {
          token.id = dbUser.id;
          token.discordId = dbUser.discordId;
          token.roles = dbUser.roles;
          token.permission = dbUser.permission;
        }
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
