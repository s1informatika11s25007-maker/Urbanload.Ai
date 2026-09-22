import { Card } from '@/components/ui/card';

export default function ZoneDetailPage({ params }: { params: { id: string } }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold">Detail Zona Poligon: {params.id}</h2>
    </Card>
  );
}
