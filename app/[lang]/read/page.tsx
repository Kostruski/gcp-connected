import trans, { Params } from '../../../translations/translate';
import { Locale, TranslationKey } from '../../../types';
import checkAuth from '../../../utils/checkAuth';
import DrawCards from '../../../components/draw-card/draw-cards';

const ReadPage = async ({
  params,
}: Readonly<{
  params: Promise<{ lang: Locale }>;
}>) => {
  await checkAuth();
  const { lang } = await params;
  const t = (key: TranslationKey, params?: Params) => trans(lang, key, params);

  return (
    <div className="d-flex flex-column h-100">
      <div className="my-4 text-center">
        <h2>{t('read_page_title')}</h2>
      </div>
      <div className="my-4 text-center">
        <p>{t('read_page_description')}</p>
      </div>
      <div className="my-4 text-center">
        <p>{t('read_page_instructions')}</p>
      </div>
      <div className="my-4 h-100">
        <DrawCards />
      </div>
    </div>
  );
};

export default ReadPage;
