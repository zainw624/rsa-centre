import Image from 'next/image';
import Link from 'next/link';
import { getPlayerProfileById } from '@/lib/db';
import { BrandHeader } from '@/components/BrandHeader';
import { ArrowLeft, User, ArrowRightLeft, ShieldAlert, Activity, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PlayerProfilePage({ params }: { params: Promise<{ playerId: string }> }) {
  const resolved = await params;
  const profile = await getPlayerProfileById(resolved.playerId);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="card-panel p-8 text-center max-w-md">
          <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground font-display tracking-tight">Profile Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The requested player profile could not be found.</p>
          <Link href="/player-profiles" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = profile.user?.image || `https://cdn.discordapp.com/embed/avatars/${(Number(profile.playerId) % 5) || 0}.png`;
  const isEligible = profile.eligible;
  const isCupTied = profile.cupTied;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href="/player-profiles" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Player Directory
        </Link>
      </div>

      <div className="card-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden bg-background border border-border shadow-xl flex items-center justify-center z-10">
          <Image src={avatarUrl} alt={profile.playerTag} fill sizes="128px" className="object-cover" unoptimized />
        </div>
        <div className="text-center sm:text-left z-10 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-display tracking-tight leading-none">{profile.playerTag}</h1>
            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg border text-[0.7rem] font-bold uppercase tracking-wider self-center sm:self-auto ${
              profile.currentStatus === 'Active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-muted border-border text-muted-foreground'
            }`}>
              {profile.currentStatus}
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Discord: <span className="text-foreground">{profile.user?.name || 'Unknown'}</span>
          </p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-sm">
            <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-lg">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Team</span>
              <span className="font-bold text-foreground">{profile.currentTeam?.teamName || 'Free Agent'}</span>
            </div>
            <div className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg ${isEligible ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-destructive/5 border-destructive/20'}`}>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">League</span>
              <span className={`font-bold ${isEligible ? 'text-emerald-400' : 'text-destructive'}`}>{isEligible ? 'Eligible' : 'Ineligible'}</span>
            </div>
            <div className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg ${isCupTied ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/30 border-border'}`}>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">Cup Status</span>
              <span className={`font-bold ${isCupTied ? 'text-amber-500' : 'text-foreground'}`}>{isCupTied ? 'Cup-Tied' : 'Clear'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Roster History */}
          <section className="card-panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Roster History</h2>
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                {profile.rosterHistory.length} records
              </span>
            </div>
            <div className="p-4">
              {profile.rosterHistory.length === 0 ? (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground">No roster history available.</div>
              ) : (
                <div className="space-y-2">
                  {profile.rosterHistory.map((entry: any) => (
                    <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-background border border-border shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-foreground">{entry.team?.teamName || 'Unknown team'}</span>
                        {entry.active && <span className="bg-primary/10 text-primary border border-primary/20 text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Active</span>}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Joined: {new Date(entry.joinedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Transfers */}
          <section className="card-panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Transfer History</h2>
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                {profile.totalTransfers} transfers
              </span>
            </div>
            <div className="p-4">
              {profile.transfers.length === 0 ? (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground">No transfer history recorded.</div>
              ) : (
                <div className="space-y-3">
                  {profile.transfers.map((transfer: any) => (
                    <div key={transfer.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-background border border-border shadow-sm">
                      <div>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded mb-2 inline-block">
                          {transfer.action || transfer.type}
                        </span>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <span className="font-medium text-muted-foreground max-w-[120px] truncate">{transfer.fromTeam || 'Free Agent'}</span>
                          <span className="text-primary font-bold">→</span>
                          <span className="font-bold text-foreground max-w-[120px] truncate">{transfer.toTeam || 'N/A'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0">{new Date(transfer.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Activity Timeline */}
          <section className="card-panel overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground font-display">Activity Timeline</h2>
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                {profile.totalActivity} events
              </span>
            </div>
            <div className="p-4">
              {profile.activity.length === 0 ? (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground">No activity timeline entries found.</div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {profile.activity.slice(0, 10).map((event: any) => (
                    <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ml-0 md:ml-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-xl bg-background border border-border shadow-sm ml-3 md:ml-0 group-hover:border-primary/30 transition-colors">
                        <p className="text-sm font-medium text-foreground">{event.text}</p>
                        <time className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mt-2 block">{new Date(event.createdAt).toLocaleString()}</time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-panel overflow-hidden border-destructive/30">
            <div className="px-6 py-4 border-b border-border bg-destructive/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h2 className="text-base font-bold text-foreground font-display">Disciplinary Record</h2>
              </div>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-destructive bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded">
                {profile.totalSanctions} sanctions
              </span>
            </div>
            <div className="p-4">
              {profile.sanctions.length === 0 ? (
                <div className="py-6 text-center">
                  <ShieldAlert className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Clean disciplinary record.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.sanctions.map((sanction: any) => (
                    <div key={sanction.id} className="p-3 rounded-xl bg-background border border-destructive/20 border-l-2 border-l-destructive shadow-sm">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-bold text-sm text-foreground">{sanction.sanctionType}</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{sanction.status}</span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 leading-relaxed">{sanction.reason || 'No reason provided'}</p>
                      <time className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground/70">{new Date(sanction.createdAt).toLocaleDateString()}</time>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
