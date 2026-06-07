import { prisma } from '@/lib/prismaClient';
import StaffCard from '@/components/StaffCard';

export const dynamic = 'force-dynamic';
const STAFF_ROLES = [
  'RSA | Founders',
  'RSA | Co Founders',
  'RSA | Executive',
  'RSA | Chairman',
  'RSA | Vice Chairman',
  'RSA | Board of Directors',
  'RSA | Director',
  'RSA | Head of Development',
  'RSA | Head Of Staff',
  'RSA | Developer',
  'RSA | Senior Staff',
  'RSA | Staff',
  'RSA | Media',
  'RSA | Panel',
  'RSA | Officials',
];

const DEPARTMENTS: Record<string, string> = {
  'RSA | Founders': 'Executive Leadership',
  'RSA | Co Founders': 'Executive Leadership',
  'RSA | Executive': 'Executive Leadership',
  'RSA | Chairman': 'Board Leadership',
  'RSA | Vice Chairman': 'Board Leadership',
  'RSA | Board of Directors': 'Board Leadership',
  'RSA | Director': 'Administration',
  'RSA | Head of Development': 'Operations Team',
  'RSA | Head Of Staff': 'Operations Team',
  'RSA | Developer': 'Operations Team',
  'RSA | Senior Staff': 'Administration',
  'RSA | Staff': 'Administration',
  'RSA | Media': 'Operations Team',
  'RSA | Panel': 'Administration',
  'RSA | Officials': 'League Operations',
};

export default async function StaffPage() {
  const users = await prisma.user.findMany({ where: { OR: STAFF_ROLES.map((r: string) => ({ roles: { has: r } })) } });

  // Group by department
  const groups: Record<string, any[]> = {};
  users.forEach((u: any) => {
    const role = (u.roles || []).find((r: string) => STAFF_ROLES.includes(r)) || 'RSA | Staff';
    const dept = DEPARTMENTS[role] || 'Administration';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push({ user: u, role });
  });

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Staff Centre</p>
        <h1 className="text-2xl font-semibold text-white">RSA Staff Directory</h1>
      </header>

      <div className="space-y-8">
        {(Object.entries(groups) as Array<[string, any[]]>).map(([dept, members]) => (
          <section key={dept}>
            <h2 className="mb-4 text-lg font-semibold text-white">{dept}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m: any) => (
                <StaffCard key={m.user.id} user={m.user} role={m.role} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
