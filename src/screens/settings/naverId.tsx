import * as React from 'react';
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { RootContext } from '../../context/appContext';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `
};

const NaverIdScreen: React.FunctionComponent = () => {
  const { mainPuppeteer } = useContext(RootContext);

  useEffect(() => {
    (async () => {
      console.log(mainPuppeteer);
    })();
  }, []);

  return (
    <S.ContainerDiv>
      <h1>네이버 아이디 설정</h1>
      <p>네이버 아이디를 1개 이상 추가해주세요.</p>
    </S.ContainerDiv>
  );
};

export default NaverIdScreen;
