import * as React from 'react';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import { IWorking } from '../../../store/Store';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 1.3rem;
    font-weight: bold;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 2rem;
  `,
  BoardNameP: styled.p`
    font-size: 1rem;
    margin: 0;
  `
};

interface IProps {
  working: IWorking;
}

const Tab4: React.FC<IProps> = ({ working }) => {
  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>작업 확인</S.ContainerTitleP>
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
        <p>네이버 아이디 {working.naverId}</p>
        <p>카페 이름 {working.cafeName}</p>
        <p>게시판 목록</p>
        {working.boardNames.map((el, idx) => (
          <S.BoardNameP key={idx}>{el.name + (el.isTradeBoard ? '(거래)' : '(일반)')}</S.BoardNameP>
        ))}
        <p>템플릿 제목 {working.templateTitle}</p>
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default Tab4;
