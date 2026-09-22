export default function LegalPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-4">
      <h2 className="text-2xl font-bold text-slate-800 capitalize">Kebijakan: {params.slug}</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Sistem UrbanLoad.AI mengatur ketentuan penggunaan slot bongkar muat, pembatalan & penalti StrikeBan, serta privasi data geolokasi pengguna.
      </p>
    </div>
  );
}
