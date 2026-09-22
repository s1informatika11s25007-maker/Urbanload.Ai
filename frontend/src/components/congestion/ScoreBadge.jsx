
export function ScoreBadge({ score }: { score}) {
  let color = 'bg-emerald-100 text-emerald-800';
  if (score >= 4 && score <= 6) color = 'bg-amber-100 text-amber-800';
  if (score >= 7 && score <= 8) color = 'bg-orange-100 text-orange-800';
  if (score >= 9) color = 'bg-rose-100 text-rose-800';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
      Skor: {score} / 10
    </span>
  );
}
