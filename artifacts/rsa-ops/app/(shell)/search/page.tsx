import SearchClient from '@/components/SearchClient';
import { BrandHeader } from '@/components/BrandHeader';

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <BrandHeader
        title="Global Search"
        subtitle="Search across players, teams, staff, fixtures and awards"
      />
      <SearchClient />
    </div>
  );
}
