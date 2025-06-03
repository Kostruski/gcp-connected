import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.scss';
import Header from '../../components/header/header';
import { Col, Container, Row } from 'react-bootstrap';
import Script from 'next/script';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang="en" className="mdl-js">
      <body id="body" className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script
          src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"
          strategy="beforeInteractive"
        />
        <Script
          id="firebase-init-global"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window.firebase !== 'undefined' && window.firebase.apps && window.firebase.apps.length === 0) {
                const firebaseConfig = ${JSON.stringify(firebaseConfig)};
                try {
                  window.firebase.initializeApp(firebaseConfig);
                } catch (e) {
                  if (!e.message.includes("already exists")) {
                    console.error("Error initializing Firebase from global script:", e);
                  }
                }
              }
            `,
          }}
        />
        <Script
          src={`https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth__${lang}.js`}
          strategy="beforeInteractive"
        ></Script>

        <Container className="py-4 h-100" fluid>
          <Row className="justify-content-center h-100">
            <Col xs={12} xl={8}>
              <Header />
              {children}
            </Col>
          </Row>
        </Container>
      </body>
    </html>
  );
}
