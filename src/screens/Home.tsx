import * as React from 'react';
import { Button, Col, Layout, Row, Table, Spin } from 'antd';
import styled from 'styled-components';

import {
  HOME_SCREEN_LOG_TABLE_COL,
  HOME_SCREEN_TEMPLATE_TABLE_COL,
  HOME_SCREEN_WORKING_TABLE_COL
} from '../utils/constants';
import Step from '../components/Step';
import NaverIdTable from '../components/NaverIdTable';
import { useContext, useEffect, useState } from 'react';
import { RootContext } from '../context/AppContext';
import { loginNaver } from '../ipc/renderer-IPC';

const { Header, Content } = Layout;

const S = {
  HeaderButton: styled(Button)`
    margin-right: 1rem;
    font-size: 1.3rem;
  `,
  HeaderSpan: styled.span`
    margin-right: 1rem;
    font-size: 1.3rem;
    color: #ffffff;
  `,
  TableCol: styled(Col)`
    margin-bottom: 2rem;
  `,
  StepTitleSpan: styled.span`
    font-size: 1.7rem;
  `
};

const HomeScreen: React.FunctionComponent = () => {
  const { naverIds, templates, workings, logs } = useContext(RootContext);
  const [loading, setLoading] = useState(true);
  const [temp, setTemp] = useState('처음');

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const result = await loginNaver([{ id: 'lys20741', password: 'dldbtjd12'}]);
      setTemp(result);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };


  return (
    <>
      <Spin tip="로딩 중 입니다..." spinning={loading}>
        <Header style={{ paddingLeft: 20, backgroundColor: '#003a70' }}>
          <Row>
            <Col span={16}>
              <S.HeaderButton ghost={true}>시작</S.HeaderButton>
              <S.HeaderButton type="danger" ghost={true}>
                종료
              </S.HeaderButton>
              <S.HeaderButton ghost={true}>예약 동작 설정</S.HeaderButton>
            </Col>
            <Col span={8}>
              <S.HeaderSpan>남은 기간: X일</S.HeaderSpan>
              <S.HeaderButton type="danger" ghost={true}>
                로그아웃
              </S.HeaderButton>
            </Col>
          </Row>
        </Header>
        <Content style={{ margin: '8px 8px' }}>
          <Row type="flex" justify="space-between">
            <h2>{temp}</h2>
            <S.TableCol span={8}>
              <NaverIdTable
                dataSource={naverIds}
                title={() => (<Step text="네이버 ID" goto={'/setting-naver-id'} login={login} />)}
              />
            </S.TableCol>
            <S.TableCol span={15}>
              <Table
                columns={HOME_SCREEN_TEMPLATE_TABLE_COL}
                dataSource={templates}
                bordered={true}
                scroll={{
                  x: true,
                  y: true
                }}
                size={'small'}
                title={() => <Step text="작성 글 템플릿" goto={'/setting-template'} />}
                locale={{
                  emptyText: '최소 하나의 데이터를 넣어주세요.'
                }}
              />
            </S.TableCol>
          </Row>
          <S.TableCol>
            <Table
              columns={HOME_SCREEN_WORKING_TABLE_COL}
              dataSource={workings}
              bordered={true}
              scroll={{
                x: true,
                y: true
              }}
              size={'small'}
              title={() => <Step text="작업 설정" goto={'/setting-working'} />}
              locale={{
                emptyText: '최소 하나의 데이터를 넣어주세요.'
              }}
            />
          </S.TableCol>
          <S.TableCol>
            <Table
              columns={HOME_SCREEN_LOG_TABLE_COL}
              dataSource={logs}
              bordered={true}
              scroll={{
                x: true,
                y: true
              }}
              size={'small'}
              title={() => (
                <>
                  <S.StepTitleSpan>작업 로그</S.StepTitleSpan>
                  <Button icon="delete" />
                </>
              )}
              locale={{
                emptyText: '최소 하나의 데이터를 넣어주세요.'
              }}
            />
          </S.TableCol>
        </Content>
      </Spin>
    </>
  );
};

export default HomeScreen;
