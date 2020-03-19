import * as React from 'react';
import { Button, Col, Row } from 'antd';
import styled from 'styled-components';
import { IWorking } from '../../../store/Store';
import TemplateTable from '../../../components/TemplateTable';
import { useContext } from 'react';
import { RootContext } from '../../../context/AppContext';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 1.3rem;
    font-weight: bold;
  `,
  BoardNameP: styled.p`
    font-size: 1rem;
    margin: 0;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 2rem;
  `
};

interface IProps {
  working: IWorking;
  setWorking: Function;
}

const Tab3: React.FC<IProps> = ({ working, setWorking }) => {
  const { templates } = useContext(RootContext);

  const selectTemplate = async (e: any, ...args: Array<any>) => {
    e.preventDefault();
    const [, record] = args;
    setWorking({ ...working, templateTitle: record.title });
  };

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>템플릿 설정</S.ContainerTitleP>
          <S.ContainerTitleP>선택된 네이버 아이디: {working.naverId}</S.ContainerTitleP>
          <S.ContainerTitleP>선택된 카페: {working.cafeName}</S.ContainerTitleP>
          <S.ContainerTitleP>선택된 게시판</S.ContainerTitleP>
          {working.boardNames.map((el, idx) => (
            <S.BoardNameP key={idx}>
              {el.name + (el.isTradeBoard ? '(거래)' : '(일반)')}
            </S.BoardNameP>
          ))}
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
        <S.ContainerTitleP>선택된 템플릿 제목: {working.templateTitle}</S.ContainerTitleP>
        <p>{working.isTrade ? '(거래)' : '(일반)'} 템플릿 목록</p>
        <TemplateTable
          dataSource={templates.filter(template => {
            if (working.isTrade) {
              return template.type === '거래글';
            } else {
              return template.type !== '거래글';
            }
          })}
          extraCols={[
            {
              title: '선택',
              dataIndex: 'delete',
              key: 'delete',
              render: (text: any, record: any, index: any) => (
                <Button onClick={e => selectTemplate(e, text, record, index)}>선택</Button>
              )
            }
          ]}
        />
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default Tab3;
