export function formatPolygonToWKT(coordinates: Array<[number, number]>): string {
  const points = coordinates.map(([lng, lat]) => `${lng} ${lat}`).join(', ');
  return `POLYGON((${points}))`;
}
