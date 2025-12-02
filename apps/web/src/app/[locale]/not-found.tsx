import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {t('title') || 'Page Not Found'}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {t('description') || "The page you're looking for doesn't exist or has been moved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>{t('message') || "Please check the URL or navigate back to the home page."}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            variant="default" 
            asChild
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              {t('home') || 'Go to Home'}
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild
            className="w-full sm:w-auto gap-2"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              {t('back') || 'Go Back'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
