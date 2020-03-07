import * as React from 'react';
import { Button, Row, Col } from 'antd';
import styled from 'styled-components';
import { useContext } from 'react';
import { RootContext } from '../../../context/AppContext';
import { setWorkingsOnDB } from '../../../store/Store';
import { Link } from 'react-router-dom';
import WorkingTable from '../../../components/WorkingTable';

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 2rem;
    font-weight: bold;
  `
};

const WorkingScreen: React.FunctionComponent = () => {
  const { workings, setWorkings } = useContext(RootContext);

  const deleteTemplate = async (e: any, ...args: Array<any>) => {
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
      <S.ContainerTitleP>작업 관리 페이지</S.ContainerTitleP>
      <Row>
        <Col span={10}>
          <Link to={'/setting-working-write'}>
            <Button>작업 추가</Button>
          </Link>
        </Col>
      </Row>

      <WorkingTable
        dataSource={workings}
        extraCols={[
          {
            title: '삭제',
            dataIndex: 'delete',
            key: 'delete',
            render: (text: any, record: any, index: any) => (
              <Button onClick={e => deleteTemplate(e, text, record, index)}>삭제</Button>
            )
          }
        ]}
      />
    </S.ContainerDiv>
  );
};

export default WorkingScreen;
