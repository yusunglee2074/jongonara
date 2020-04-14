import * as React from 'react';
import { Button, Row, Col, Input, Checkbox, InputNumber, message } from 'antd';
import styled from 'styled-components';
import { useContext } from 'react';
import { useState } from 'react';
import { ITemplate, setTemplatesOnDB } from '../../../store/Store';
import { RootContext } from '../../../context/AppContext';
import NaverSmartEditor from '../../../components/NaverSmartEditor';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useEffect } from 'react';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 2rem;
  `
};

const TradeTemplateWriteScreen: React.FC<RouteComponentProps> = ({ history }) => {
  const [template, setTemplate] = useState({
    type: '거래글',
    price: 0,
    tags: '',
    title: '',
    text: ''
  } as ITemplate);
  const { templates, setTemplates, isNaverLoggedIn } = useContext(RootContext);

  useEffect(() => {
    if (!isNaverLoggedIn) {
      message.warning('메인 대쉬보드에서 로그인을 먼저 진행해주세요.');
      history.push('/home');
    }
  }, []);

  const save = async () => {
    const iframes = document.getElementsByTagName('iframe');
    const firstIframe = iframes[0];
    if (firstIframe) {
      // @ts-ignore
      const innerDoc = firstIframe.contentDocument || firstIframe.contentWindow.document;

      const secondIframe = innerDoc.getElementById('se2_iframe') as HTMLIFrameElement;
      if (secondIframe) {
        // @ts-ignore
        const secondInnerDoc = secondIframe.contentDocument || firstIframe.contentWindow.document;
        const bodies = secondInnerDoc.getElementsByTagName('body');
        const body = bodies[0];
        setTemplate({ ...template, text: body.innerHTML });
        //TODO:발리데이션

        try {
          const found = templates.find(el => el.title === template.title);
          if (found) {
            console.log('이미 존재하는 제목입니다.');
          } else {
            const newTemplates = [...templates, { ...template, text: body.innerHTML }];
            setTemplates(newTemplates);
            await setTemplatesOnDB(newTemplates);
            history.push('/home');
          }
        } catch (e) {
          console.log('에러', e);
          setTemplates(templates);
          await setTemplatesOnDB(templates);
        }
      }
    }
  };

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>거래글 쓰기 화면입니다.</S.ContainerTitleP>
        </Col>
        <Col span={4}>
          <Button type="primary" onClick={save}>
            저장
          </Button>
        </Col>
        <Input
          placeholder="글 제목"
          value={template.title}
          onChange={e => setTemplate({ ...template, title: e.target.value })}
        />
        <Input
          placeholder="태그는 쉼표로 구분하며, 10개까지 입력하실 수 있습니다."
          value={template.tags}
          onChange={e => setTemplate({ ...template, tags: e.target.value })}
        />
        <InputNumber
          placeholder="판매가격"
          defaultValue={template.price === 0 ? undefined : template.price}
          onChange={num => setTemplate({ ...template, price: num })}
        />
        <Checkbox
          defaultChecked={template.exposePhoneNumber}
          checked={template.exposePhoneNumber}
          onChange={e =>
            setTemplate({
              ...template,
              exposePhoneNumber: e.target.checked,
              useTempPhoneNumber: e.target.checked
            })
          }
        >
          연락처 노출 동의
        </Checkbox>
        <Checkbox
          defaultChecked={template.useTempPhoneNumber}
          checked={template.useTempPhoneNumber}
          disabled={!template.exposePhoneNumber}
          onChange={e => setTemplate({ ...template, useTempPhoneNumber: e.target.checked })}
        >
          일회용 안심 번호 사용
        </Checkbox>{' '}
      </S.HeaderRow>
      <S.BodyRow>
        <Col span={24}>
          <NaverSmartEditor />
        </Col>
        <img src="" />
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default withRouter(TradeTemplateWriteScreen);
