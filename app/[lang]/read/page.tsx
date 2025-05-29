import { Col, Container, Row } from 'react-bootstrap';

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
    <Container>
      <Row>
        <Col>{t('read_page_title')}</Col>
      </Row>
      <Row>
        <Col>{t('read_page_description')}</Col>
      </Row>
      <Row>
        <Col>
          <p>{t('read_page_instructions')}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <DrawCards />
        </Col>
      </Row>
    </Container>
  );
};

export default ReadPage;
