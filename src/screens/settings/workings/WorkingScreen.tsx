import * as React from 'react';
import { Button, message } from 'antd';
import styled from 'styled-components';
import { useContext, useEffect } from 'react';
import { RootContext } from '../../../context/AppContext';
import { setWorkingsOnDB } from '../../../store/Store';
import { Link, RouteComponentProps } from 'react-router-dom';
import WorkingTable from '../../../components/WorkingTable';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `,
  AddLinkDiv: styled.div`
    margin-bottom: 1rem;
  `
};

const WorkingScreen: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const { workings, setWorkings, isNaverLoggedIn } = useContext(RootContext);

  useEffect(() => {
    if (!isNaverLoggedIn) {
      message.warning('메인 대쉬보드에서 로그인을 먼저 진행해주세요.');
      history.push('/home');
    }
  }, []);

  const deleteWorking = async (e: any, ...args: Array<any>) => {
    e.preventDefault();
    const [, record] = args;
    const { workingId } = record;
    try {
      const newWorkings = workings.filter(el => el.workingId !== workingId);
      await setWorkings(newWorkings);
      await setWorkingsOnDB(newWorkings);
    } catch (e) {
      console.log(e);
      await setWorkings(workings);
      await setWorkingsOnDB(workings);
    }
  };

  return (
    <S.ContainerDiv>
      <S.ContainerTitleP>작업 설정</S.ContainerTitleP>
      <S.AddLinkDiv>
        <Link to={'/setting-working-write'}>
          <Button type="primary">작업 추가</Button>
        </Link>
      </S.AddLinkDiv>
      <WorkingTable
        dataSource={workings}
        extraCols={[
          {
            title: '삭제',
            dataIndex: 'delete',
            key: 'delete',
            render: (text: any, record: any, index: any) => (
              <Button onClick={e => deleteWorking(e, text, record, index)}>삭제</Button>
            )
          }
        ]}
      />
    </S.ContainerDiv>
  );
};

export default WorkingScreen;
