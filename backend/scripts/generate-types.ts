import { execSync } from 'child_process';

console.log('Generating Supabase TypeScript types...');
try {
  execSync('npx supabase gen types typescript --local > ../frontend/types/database.ts', {
    stdio: 'inherit',
  });
  console.log('Successfully generated frontend/types/database.ts');
} catch (error) {
  console.error('Failed to generate types:', error);
}
