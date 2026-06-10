"use client";
import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { Plus, Calendar } from 'lucide-react';

interface TeamOption {
  name: string;
  code: string;
  group: 'A' | 'B' | 'C' | 'D';
  logo: string;
}

function TeamLogo({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <Image
      src={errored ? '/assets/rsa1.png' : src}
      alt={alt}
      fill
      sizes="48px"
      className="object-contain"
      onError={() => setErrored(true)}
    />
  );
}

export default function FixturesClient({
  initial,
  isAdmin,
  teams,
}: {
  initial: any[];
  isAdmin: boolean;
  teams: TeamOption[];
}) {
  const [fixtures, setFixtures] = useState<any[]>(initial || []);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/fixtures');
    if (res.ok) setFixtures(await res.json());
  }, []);

  const logoSrc = useCallback(
    (code?: string | null) => {
      const slug = teams.find((t) => t.code === code)?.logo;
      return slug ? `/assets/${slug}.png` : '/assets/rsa1.png';
    },
    [teams]
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const homeCode = String(form.get('homeTeamCode') || '');
    const awayCode = String(form.get('awayTeamCode') || '');
    const home = teams.find((t) => t.code === homeCode);
    const away = teams.find((t) => t.code === awayCode);

    if (!home || !away) {
      setError('Please select both teams.');
      return;
    }
    if (home.code === away.code) {
      setError('Home and away teams must be different.');
      return;
    }

    const kickoff = String(form.get('kickoff') || '');
    if (!kickoff) {
      setError('Please choose a kickoff date and time.');
      return;
    }

    const baseCompetition = String(form.get('competition') || '').trim() || 'RSA World Cup 2026';
    const group = String(form.get('group') || '');
    const competition = group ? `${baseCompetition} · Group ${group}` : baseCompetition;

    const payload = {
      homeTeam: home.name,
      homeTeamCode: home.code,
      awayTeam: away.name,
      awayTeamCode: away.code,
      kickoff,
      competition,
      venue: String(form.get('venue') || '').trim() || null,
      notes: String(form.get('notes') || '').trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          res.status === 403
            ? 'You do not have permission to add fixtures.'
            : data?.error || 'Could not add the fixture. Please try again.'
        );
        return;
      }
      setIsCreating(false);
      (e.target as HTMLFormElement).reset();
      await refresh();
    } catch {
      setError('Could not add the fixture. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20';

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setError(null);
              setIsCreating((v) => !v);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Cancel' : 'Add Fixture'}
          </button>
        </div>
      )}

      {isAdmin && isCreating && (
        <form
          onSubmit={handleCreate}
          className="card-panel p-5 animate-in fade-in slide-in-from-top-4 border-primary/30"
        >
          <h3 className="text-lg font-bold text-foreground font-display mb-4">Schedule New Fixture</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Home Team</label>
              <select name="homeTeamCode" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select home team</option>
                {teams.map((t) => (
                  <option key={t.code} value={t.code}>{t.name} (Group {t.group})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Away Team</label>
              <select name="awayTeamCode" required defaultValue="" className={inputClass}>
                <option value="" disabled>Select away team</option>
                {teams.map((t) => (
                  <option key={t.code} value={t.code}>{t.name} (Group {t.group})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kickoff (date &amp; time)</label>
              <input name="kickoff" type="datetime-local" required className={`${inputClass} [color-scheme:dark]`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Group (optional)</label>
              <select name="group" defaultValue="" className={inputClass}>
                <option value="">No group</option>
                <option value="A">Group A</option>
                <option value="B">Group B</option>
                <option value="C">Group C</option>
                <option value="D">Group D</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Competition</label>
              <input name="competition" defaultValue="RSA World Cup 2026" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Venue (optional)</label>
              <input name="venue" placeholder="e.g. Wembley" className={inputClass} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
              <input name="notes" placeholder="Any extra details" className={inputClass} />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save Fixture'}
            </button>
          </div>
        </form>
      )}

      {fixtures.length === 0 ? (
        <div className="card-panel p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground font-display">No fixtures scheduled</p>
          <p className="mt-1 text-sm text-muted-foreground font-medium">
            {isAdmin ? 'Use “Add Fixture” above, or schedule one via the Discord bot.' : 'Fixtures can be added via the Discord bot or admin panel'}
          </p>
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fixtures.map((f: any) => (
            <div key={f.id} className="card-panel p-5 group flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {f.competition || 'League Match'}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    {new Date(f.kickoff).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    {new Date(f.kickoff).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-auto py-2">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center p-1.5">
                    <TeamLogo src={logoSrc(f.homeTeamCode)} alt={f.homeTeam} />
                  </div>
                  <span className="text-sm font-bold text-foreground text-center line-clamp-2 leading-tight">{f.homeTeam}</span>
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">VS</span>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative w-12 h-12 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center p-1.5">
                    <TeamLogo src={logoSrc(f.awayTeamCode)} alt={f.awayTeam} />
                  </div>
                  <span className="text-sm font-bold text-foreground text-center line-clamp-2 leading-tight">{f.awayTeam}</span>
                </div>
              </div>

              {f.notes && (
                <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground font-medium">
                  {f.notes}
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
