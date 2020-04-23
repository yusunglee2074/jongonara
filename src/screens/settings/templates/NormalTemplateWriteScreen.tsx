import * as React from 'react';
import { Button, Row, Col, Input, message } from 'antd';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import { ITemplate, setTemplatesOnDB } from '../../../store/Store';
import { RootContext } from '../../../context/AppContext';
import NaverSmartEditor from '../../../components/NaverSmartEditor';
import { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';

const S = {
  ContainerDiv: styled.div`
    width: 60rem;
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
  `,
  SaveButton: styled(Button)`
    margin-top: 2rem;
    width: 15rem;
  `
};

const NormalTemplateWriteScreen: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const [template, setTemplate] = useState({
    type: '일반글',
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
        //TODO:발리데이션, 이미지 추출
        const prevTemplates = [...templates];
        const found = prevTemplates.find(el => el.title === template.title);
        if (found) {
          console.log('이미 존재하는 제목입니다.');
        } else {
          const newTemplates = [...templates, { ...template, text: body.innerHTML }];
          try {
            await setTemplates(newTemplates);
            await setTemplatesOnDB(newTemplates);
            history.push('/setting-template')
          } catch (e) {
            console.log(e);
            await setTemplates(prevTemplates);
            await setTemplatesOnDB(prevTemplates);
          }
        }
      }
    }
  };

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <S.ContainerTitleP>일반 글 작성</S.ContainerTitleP>
        <Input
          placeholder="글 제목"
          value={template.title}
          onChange={e => setTemplate({ ...template, title: e.target.value })}
        />
      </S.HeaderRow>
      <S.BodyRow>
        <Col span={24}>
          <NaverSmartEditor />
        </Col>
      </S.BodyRow>
      <Input
        placeholder="태그는 쉼표로 구분하며, 10개까지 입력하실 수 있습니다."
        value={template.tags}
        onChange={e => setTemplate({ ...template, tags: e.target.value })}
      />
      <div>
        <S.SaveButton type="primary" onClick={save}>
          저장
        </S.SaveButton>
      </div>
    </S.ContainerDiv>
  );
};

export default NormalTemplateWriteScreen;
