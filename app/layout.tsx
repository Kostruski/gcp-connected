import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.scss';
import { cookies } from 'next/headers';
import getFirebaseAppServerSide from './lib/firebase/get-firebase-app-server-side';
import { redirect } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Intiitius',
  description: 'Tarrot app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionCookie = (await cookies()).get('__session')?.value;

  if (!sessionCookie) {
    return redirect('/login');
  }
  const { auth } = await getFirebaseAppServerSide();

  try {
    auth.verifyIdToken(sessionCookie ?? '');
  } catch (error: any) {
    console.error('Error verifying ID token:', error);
    return redirect('/login');
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
