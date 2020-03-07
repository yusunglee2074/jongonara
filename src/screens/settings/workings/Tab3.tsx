import * as React from 'react';
import { Col, Row } from 'antd'
import styled from 'styled-components';

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
  `
};

const Tab3: React.FC = () => {

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>템플릿 설정</S.ContainerTitleP>
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default Tab3;
