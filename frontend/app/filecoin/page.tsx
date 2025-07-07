import { Metadata } from 'next';
import FilecoinStorageDashboard from '@/components/ui/FilecoinStorageDashboard';

export const metadata: Metadata = {
  title: 'Filecoin Storage | ResearchGraph AI',
  description: 'Store and retrieve research data on Filecoin with programmable storage contracts and USDFC payments',
};

export default function FilecoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <FilecoinStorageDashboard />
      </div>
    </div>
  );
} 