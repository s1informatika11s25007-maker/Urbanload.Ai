export function formatPolygonToWKT(coordinates: Array<[number, number]>){
  const points = coordinates.map(([lng, lat]) => `${lng} ${lat}`).join(', ');
  return `POLYGON((${points}))`;
}
