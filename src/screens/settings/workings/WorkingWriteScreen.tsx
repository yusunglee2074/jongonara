import * as React from 'react';
import { Col, Row, Button } from 'antd';
import styled from 'styled-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Tab1 from './Tab1';
import Tab3 from './Tab3';
import Tab2 from './Tab2';
import Tab4 from './Tab4';
import { IWorking } from '../../../store/Store'

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

const WorkingWriteScreen: React.FC<RouteComponentProps> = () => {
  const [tabIdx, setTabIdx] = useState(0);
  const [cafeList, setCafeList] = useState([]);
  const [working, setWorking] = useState({
    workingId: '',
    minPerWrite: 5,
    checkFourBoards: true,
    naverId: '',
    cafeName: '',
    cafeUrl: '',
    boardNames: [],
    templateTitle: ''
  } as IWorking);

  const renderTab = () => {
    switch (tabIdx) {
      case 0:
        return (
          <Tab1
            naverId={working.naverId}
            setNaverId={(id: string) => setWorking({ ...working, naverId: id })}
          />
        );
      case 1:
        return <Tab2
          cafeList={cafeList}
          setCafeList={setCafeList}
          working={working}
          setWorking={(working: IWorking) => setWorking(working)}
        />;
      case 2:
        return <Tab3 />;
      case 3:
        return <Tab4 />;
      default:
        return <p>오류</p>;
    }
  };

  const prevTab = () => {
    if (tabIdx > 0) {
      setTabIdx(tabIdx - 1);
    }
  };
  const nextTab = () => {
    if (tabIdx === 0) {
      if (!working.naverId) {
        console.log('네이버 아이디를 선택해주세요.');
        return;
      }
    }
    if (tabIdx < 3) {
      setTabIdx(tabIdx + 1);
    }
  };

  const save = () => {
    console.log('세ㅣ븍 ');
  };

  useEffect(() => {
    console.log(working, setWorking);
  }, []);

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>작업 추가 {tabIdx + 1} / 4</S.ContainerTitleP>
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
        {renderTab()}
        <Button onClick={prevTab}>이전</Button>
        {tabIdx === 3 ? (
          <Button type={'primary'} onClick={save}>
            저장
          </Button>
        ) : (
          <Button onClick={nextTab}>다음</Button>
        )}
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default withRouter(WorkingWriteScreen);