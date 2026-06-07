export default function LeagueTablePreview({ rows }: { rows: Array<any> }) {
  return (
    <div className="card rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-rsa-gold">League Table Snapshot</p>
      <table className="mt-3 w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="text-left">#</th>
            <th className="text-left">Team</th>
            <th className="text-right">P</th>
            <th className="text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={4} className="py-3 text-slate-500 text-xs">No data</td></tr>
          ) : rows.map((r: any) => (
            <tr key={r.id} className="border-t border-transparent">
              <td className="py-2 text-slate-300">{r.position}</td>
              <td className="py-2 text-white">{r.team?.teamName ?? '—'}</td>
              <td className="py-2 text-slate-300 text-right">{r.played}</td>
              <td className="py-2 text-slate-300 text-right">{r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
