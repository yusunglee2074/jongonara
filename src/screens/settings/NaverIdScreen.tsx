import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Form, Icon, Input, message } from 'antd'
import NaverIdTable from '../../components/NaverIdTable';
import { FormEvent } from 'react';
import { RootContext } from '../../context/AppContext';
import { setNaverIdsOnDB, setWorkingsOnDB } from '../../store/Store'
import { APP_STRING } from '../../utils/constants'

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  Form: styled(Form)`
  text-align: center;
  `,
  Input: styled(Input)`
    margin: 0.5rem 0;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `,
  SaveButton: styled(Button)`
  width: 100%;
  max-width: 13rem;
  margin-bottom: 1rem;
  height: 2.2rem;
  font-size: 1.2rem;
  `,
};

const NaverIdScreen: React.FunctionComponent = () => {
  const [naverId, setNaverId] = useState('');
  const [pwd, setPwd] = useState('');
  const { naverIds, setNaverIds, workings, setWorkings } = useContext(RootContext);

  useEffect(() => {
    (async () => {})();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const prevNaverIds = [...naverIds];
    const found = prevNaverIds.find(el => el.id === naverId);
    if (found) {
      message.info('이미 추가 되어있는 아이디 입니다.')
    } else {
      const newNaverIds = [
        ...naverIds,
        { id: naverId, password: pwd, connection: '로그인을 시도해주세요.' }
      ];
      try {
        await setNaverIds(newNaverIds);
        await setNaverIdsOnDB(newNaverIds);
      } catch (e) {
        console.log(e);
        await setNaverIds(prevNaverIds);
        await setNaverIdsOnDB(prevNaverIds);
      }
    }
  };

  const deleteNaverId = async (e: any, ...args: Array<any>) => {
    e.preventDefault();
    if (confirm('정말 삭제하시겠습니까?')) {
      const [, record] = args;
      const { id } = record;
      try {
        const prevWorkings = [...workings];
        const newWorkings = prevWorkings.map(el => {
          if (el.naverId === id) {
            return { ...el, naverId: APP_STRING.deletedId}
          } else {
            return el
          }
        })
        setWorkings(newWorkings);
        const newNaverIds = naverIds.filter(el => el.id !== id);
        await setNaverIds(newNaverIds);
        await setNaverIdsOnDB(newNaverIds);
        await setWorkingsOnDB(newWorkings);
      } catch (e) {
        await setNaverIds(naverIds);
        await setNaverIdsOnDB(naverIds);
        await setWorkings(workings);
        await setWorkingsOnDB(workings);
      }
    }
  };

  return (
    <S.ContainerDiv>
      <S.ContainerTitleP>네이버 아이디 추가/제거</S.ContainerTitleP>
      <S.Form layout={'inline'} onSubmit={onSubmit}>
        <S.Input
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="아이디"
          value={naverId}
          onChange={e => setNaverId(e.target.value)}
        />
        <S.Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          type="password"
          value={pwd}
          placeholder="패스워드"
          onChange={e => setPwd(e.target.value)}
        />
        <S.SaveButton onClick={onSubmit} type="primary" htmlType="submit" className="login-form-button">
          추가
        </S.SaveButton>
      </S.Form>
      <NaverIdTable
        dataSource={naverIds}
        extraCols={[
          {
            title: '삭제',
            dataIndex: 'delete',
            key: 'delete',
            render: (text: any, record: any, index: any) => (
              <Button onClick={e => deleteNaverId(e, text, record, index)}>삭제</Button>
            )
          }
        ]}
      />
    </S.ContainerDiv>
  );
};

export default NaverIdScreen;
