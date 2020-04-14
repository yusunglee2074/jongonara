import * as React from 'react';
import { useContext } from 'react';
import { Col, Radio, Row } from 'antd';
import styled from 'styled-components';
import { RootContext } from '../../../context/AppContext';
import { RadioChangeEvent } from 'antd/lib/radio/interface';

const S = {
  ContainerDiv: styled.div`
  `,
  ContainerTitleP: styled.p`
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 2rem;
  `,
  Radio: styled(Radio)`
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  `
};

interface IProps {
  naverId: string;
  setNaverId: Function;
}

const Tab1: React.FC<IProps> = ({ naverId, setNaverId }) => {
  const { naverIds } = useContext(RootContext);

  const renderRadio = () => {
    return naverIds.map(id => {
      return (
        <S.Radio key={id.id} value={id.id}>
          {id.id}
        </S.Radio>
      );
    });
  };

  const onChange = (e: RadioChangeEvent) => {
    setNaverId(e.target.value);
  };

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>아이디 선택</S.ContainerTitleP>
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
        <Radio.Group onChange={onChange} value={naverId}>
          {renderRadio()}
        </Radio.Group>
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default Tab1;
