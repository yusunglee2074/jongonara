import * as React from 'react';
import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components';
import { Button, Form, Icon, Input } from 'antd';
import NaverIdTable from '../../components/NaverIdTable';
import { FormEvent } from 'react'
import { RootContext } from '../../context/AppContext'
import { setNaverIdsOnDB } from '../../store/Store'

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
  const [naverId, setNaverId] = useState('');
  const [pwd, setPwd] = useState('');
  const { naverIds, setNaverIds } = useContext(RootContext);

  useEffect(() => {
    (async () => {
    })();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const prevNaverIds = [...naverIds];
    const newNaverIds = [...naverIds, { id: naverId, password: pwd }]
    try {
      await setNaverIds(newNaverIds);
      await setNaverIdsOnDB(newNaverIds);
    } catch (e) {
      console.log(e);
      await setNaverIds(prevNaverIds);
      await setNaverIdsOnDB(prevNaverIds);
    }
  };

  const deleteNaverId = async (e: any, text: any, record: any, index: any) => {
    e.preventDefault();
    console.log(text)
    console.log(record)
    console.log(index)
  }

  return (
    <S.ContainerDiv>
      <S.ContainerTitleP>네이버 아이디 추가/제거</S.ContainerTitleP>
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
            render: (text:any, record:any, index: any) => <Button onClick={e => deleteNaverId(e, text, record, index)}>삭제</Button>
          }
        ]}
      />
    </S.ContainerDiv>
  );
};

export default NaverIdScreen;
