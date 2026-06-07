import SearchClient from '@/components/SearchClient';

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-6">
        <p className="text-sm uppercase tracking-widest text-rsa-gold">Global Search</p>
        <h1 className="text-2xl font-semibold text-white">Search across players, teams, staff, fixtures and awards</h1>
      </header>
      <SearchClient />
    </div>
  );
}
