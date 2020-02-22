import * as React from 'react';
import { useContext, useEffect } from 'react'
import { RootContext } from '../../appContext'

const NaverIdScreen: React.FunctionComponent = () => {
  const { mainPuppeteer } = useContext(RootContext);

  useEffect(() => {
    (async () => {
      console.log(mainPuppeteer);
    })()
  }, [])

  return (
    <>
      <h1>STEP 1. 네이버 아이디 설정</h1>
      <p>네이버 아이디를 1개 이상 추가해주세요.</p>
    </>
  );
};

export default NaverIdScreen;
