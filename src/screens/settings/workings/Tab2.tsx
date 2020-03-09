import * as React from 'react';
import { Col, Row, Spin, Button, Radio } from 'antd';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getNaverCafes } from '../../../ipc/renderer-IPC';
import { IWorking } from '../../../store/Store';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import errorCodes from '../../../utils/errorCodes'

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
    font-size: 1rem;
  `,
  Radio: styled(Radio)`
    display: block;
    height: 30px;
    lineHeight: 30px;
  `
};

interface IProps {
  working: IWorking;
  setWorking: Function;
  cafeList: Array<any>;
  setCafeList: Function;
}

const Tab2: React.FC<IProps> = ({ working, setWorking, cafeList, setCafeList }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCafe = async () => {
      try {
        setCafeList(await getCafeLists());
      } catch (e) {
        if (e.message === errorCodes['401']) {
          console.log('로그인을 먼저 진행해주세요.')
        }
      }
    };
    if (cafeList.length === 0) {
      getCafe();
    }
  }, []);

  const getCafeLists = async () => {
    setLoading(true);
    const cafes = await getNaverCafes('byul6474');
    setLoading(false);
    return cafes;
  };

  const renderCafeList = () => {
    return cafeList.map(el => {
      return (
        <S.Radio value={el.name} key={el.url}>
          {el.name}
        </S.Radio>
      );
    });
  };

  const onChange = (e: RadioChangeEvent) => {
    const { url, name } = cafeList.find(el => el.name === e.target.value);

    setWorking({
      ...working,
      cafeName: name,
      cafeUrl: url
    });
  };

  return (
    <S.ContainerDiv>
      <Spin tip="데이터를 가져오는 중 입니다." spinning={loading}>
        <S.HeaderRow>
          <Col span={20}>
            <S.ContainerTitleP>카페, 게시판 설정</S.ContainerTitleP>
            <S.ContainerTitleP>선택된 네이버 아이디: {working.naverId}</S.ContainerTitleP>
          </Col>
        </S.HeaderRow>
        <S.BodyRow>
          <p>
            카페목록 <Button onClick={getCafeLists}>다시가져오기</Button>
          </p>
          <Radio.Group onChange={onChange} value={working.cafeName}>
            {renderCafeList()}
          </Radio.Group>
          <p>게시판 목록</p>
        </S.BodyRow>
      </Spin>
    </S.ContainerDiv>
  );
};

export default Tab2;
