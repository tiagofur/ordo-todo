import { Link } from '@/i18n/routing';
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p className="mb-4">Could not find requested resource</p>
      <Link href="/" className="text-primary hover:underline">Return Home</Link>
    </div>
  );
}
