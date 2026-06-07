import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
    error: '/login'
  }
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/player-profiles/:path*',
    '/teams/:path*',
    '/managers/:path*',
    '/staff/:path*',
    '/rosters/:path*',
    '/transfers/:path*',
    '/discipline/:path*',
    '/fixtures/:path*',
    '/results/:path*',
    '/world-cup/:path*',
    '/league-table/:path*',
    '/statistics/:path*',
    '/compliance/:path*',
    '/activity/:path*',
    '/administration/:path*',
    '/archives/:path*',
    '/awards/:path*',
    '/hall-of-fame/:path*',
    '/notifications/:path*',
    '/search/:path*',
    '/playerinfo/:path*'
  ]
};
