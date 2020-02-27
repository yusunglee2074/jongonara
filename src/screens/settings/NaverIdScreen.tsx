import * as React from 'react';
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components';
import { Button, Form, Icon, Input } from 'antd';
import { RootContext } from '../../context/AppContext';
import NaverIdTable from '../../components/NaverIdTable';
import { FormEvent } from 'react'

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `
};

const NaverIdScreen: React.FunctionComponent = () => {
  const { mainPuppeteer,contextUser, naverIds, setNaverIds } = useContext(RootContext);
  const [naverId, setNaverId] = useState('');
  const [pwd, setPwd] = useState('');
  const [temp, setTemp] = useState('')

  useEffect(() => {
    (async () => {
      console.log(mainPuppeteer);
      console.log(naverIds, '네이버아이디');
      console.log(setNaverIds);
    })();
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // 퍼피티어 페이지 만들고 로그인 하고 mainPup 상태 업데이트
    setNaverIds([...naverIds, { key: 1231, id: 1231, naverId: naverId, connection: '접속'}])
  };

  const getData = async () => {
    const page = mainPuppeteer.pageProcesses[0].page;
    await page.goto('https://www.naver.com');



    setTemp(page.url());

  }

  return (
    <S.ContainerDiv>
      <S.ContainerTitleP>네이버 아이디 추가/제거</S.ContainerTitleP>
      <span>{contextUser.msg}</span>
      <span>{contextUser.err.toString()}</span>
      <span onClick={() => getData()}>기 클릭 테스트</span>
      <span>{temp}</span>
      <Form layout={'inline'} onSubmit={onSubmit}>
        <Input
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="아이디"
          value={naverId}
          onChange={e => setNaverId(e.target.value)}
        />
        <Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          type="password"
          value={pwd}
          placeholder="패스워드"
          onChange={e => setPwd(e.target.value)}
        />
        <Button onClick={onSubmit} type="primary" htmlType="submit" className="login-form-button">
          추가
        </Button>
      </Form>
      <NaverIdTable
        dataSource={naverIds}
        extraCols={[
          {
            title: '삭제',
            dataIndex: 'delete',
            key: 'delete',
            render: () => <Button>삭제</Button>
          }
        ]}
      />
    </S.ContainerDiv>
  );
};

export default NaverIdScreen;
