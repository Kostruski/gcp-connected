import { Button } from 'react-bootstrap';
import GoldenStar from '../../components/golden-star/golden-star';
import trans, { Params } from '../../translations/translate';
import { Locale, TranslationKey } from '../../types';
import checkAuth from '../../utils/checkAuth';
import Link from 'next/link';

const HomePage = async ({
  params,
}: Readonly<{
  params: Promise<{ lang: Locale }>;
}>) => {
  await checkAuth();
  const { lang } = await params;
  const t = (key: TranslationKey, params?: Params) => trans(lang, key, params);

  return (
    <div className="vstack gap-3">
      <div className="text-center my-4">{t('home_page_title')}</div>
      <Link href={'/read'} className="mx-auto">
        <Button variant="primary" className="mx-auto">
          {t('home_page_button')}
        </Button>
      </Link>
      <GoldenStar />
    </div>
  );
};

export default HomePage;
