import * as React from 'react';
import { Button, Col, Row } from 'antd';
import styled from 'styled-components';
import { IWorking } from '../../../store/Store';
import TemplateTable from '../../../components/TemplateTable';
import { useContext } from 'react';
import { RootContext } from '../../../context/AppContext';
import { LineOutlined } from '@ant-design/icons/lib';

const S = {
  ContainerDiv: styled.div``,
  ContainerTitleP: styled.p`
    font-size: 1.9rem;
    font-weight: bold;
    margin-bottom: 1rem;
  `,
  ContainerSubTitleP: styled.p`
    font-size: 1.4rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  `,
  SubDescriptionP: styled.p`
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
    color: #124a00;
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
          <S.ContainerSubTitleP>선택된 네이버 아이디</S.ContainerSubTitleP>
          <S.SubDescriptionP>
            <LineOutlined /> {working.naverId}
          </S.SubDescriptionP>
          <S.ContainerSubTitleP>선택된 카페</S.ContainerSubTitleP>
          <S.SubDescriptionP>
            <LineOutlined /> {working.cafeName}
          </S.SubDescriptionP>
          <S.ContainerSubTitleP>선택된 게시판</S.ContainerSubTitleP>
          {working.boardNames.map((el, idx) => (
            <S.SubDescriptionP key={idx}>
              <LineOutlined /> {el.name + (el.isTradeBoard ? ' (거래게시판)' : ' (일반게시판)')}
            </S.SubDescriptionP>
          ))}
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
        <S.ContainerSubTitleP>선택된 템플릿</S.ContainerSubTitleP>
        <S.SubDescriptionP>
          {working.templateTitle ? (
            <S.SubDescriptionP>
              <LineOutlined /> {working.templateTitle}
            </S.SubDescriptionP>
          ) : (
            <span>아래 목록에서 템플릿을 선택해주세요.</span>
          )}
        </S.SubDescriptionP>
        <S.ContainerSubTitleP>{working.isTrade ? '거래' : '일반'} 템플릿 목록</S.ContainerSubTitleP>
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
