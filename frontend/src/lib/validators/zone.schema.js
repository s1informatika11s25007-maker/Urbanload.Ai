import { z } from 'zod';

export const zoneSchema = z.object({
  name: z.string().min(3, 'Nama zona minimal 3 karakter'),
  maxTruckCapacity: z.number().min(1, 'Kapasitas minimal 1 truk'),
  operatingHoursStart: z.string(),
  operatingHoursEnd: z.string(),
  zoneType: z.enum(['logistics', 'culinary', 'mixed']),
  priorityLevel: z.enum(['normal', 'priority_pass']),
});

export type ZoneSchemaType = z.infer<typeof zoneSchema>;
