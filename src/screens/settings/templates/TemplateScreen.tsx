import * as React from 'react';
import { Button, Row, Col } from 'antd';
import styled from 'styled-components';
import TemplateTable from '../../../components/TemplateTable';
import { useContext } from 'react';
import { RootContext } from '../../../context/AppContext';
import { setTemplatesOnDB } from '../../../store/Store';
import { Link } from 'react-router-dom';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `
};

const TemplateScreen: React.FunctionComponent = () => {
  const { templates, setTemplates } = useContext(RootContext);

  const deleteTemplate = async (e: any, ...args: Array<any>) => {
    e.preventDefault();
    const [, record] = args;
    const { title } = record;
    try {
      const newTemplates = templates.filter(el => el.title !== title);
      await setTemplates(newTemplates);
      await setTemplatesOnDB(newTemplates);
    } catch (e) {
      console.log(e);
      await setTemplates(templates);
      await setTemplatesOnDB(templates);
    }
  };

  return (
    <S.ContainerDiv>
      <S.ContainerTitleP>글 템플릿 관리 페이지</S.ContainerTitleP>
      <Row>
        <Col span={10}>
          <Link to={'/setting-template-trade-write'}>
            <Button>거래 글 추가</Button>
          </Link>
        </Col>
        <Col span={10}>
          <Link to={'/setting-template-normal-write'}>
            <Button>일반 글 추가</Button>
          </Link>
        </Col>
      </Row>

      <TemplateTable
        dataSource={templates}
        extraCols={[
          {
            title: '삭제',
            dataIndex: 'delete',
            key: 'delete',
            render: (text: any, record: any, index: any) => (
              <Button onClick={e => deleteTemplate(e, text, record, index)}>삭제</Button>
            )
          }
        ]}
      />
    </S.ContainerDiv>
  );
};

export default TemplateScreen;
