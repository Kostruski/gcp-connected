import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.scss';
import Header from '../components/header';
import { Col, Container, Row } from 'react-bootstrap';

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
  return (
    <html lang="en">
      <body id="body" className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <Container fluid className="p-4">
          <Row>
            <Col xs={12}>{children}</Col>
          </Row>
        </Container>
      </body>
    </html>
  );
}
