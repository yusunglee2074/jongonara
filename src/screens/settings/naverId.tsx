import * as React from 'react';
import { useContext, useEffect } from 'react';
import styled from 'styled-components';
import { RootContext } from '../../context/appContext';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
  font-size: 2rem;
  font-weight: bold;
  `,

};

const NaverIdScreen: React.FunctionComponent = () => {
  const { mainPuppeteer, naverIds, setNaverIds } = useContext(RootContext);

  useEffect(() => {
    (async () => {
      console.log(mainPuppeteer);
      console.log(naverIds, '네이버아이디');
      console.log(setNaverIds);
    })();
  }, []);

  return (
    <S.ContainerDiv>
      <S.ContainerTitleP>네이버 아이디 추가/제거</S.ContainerTitleP>
      <p>아이디를 1개 이상 추가해주세요.</p>
    </S.ContainerDiv>
  );
};

export default NaverIdScreen;
