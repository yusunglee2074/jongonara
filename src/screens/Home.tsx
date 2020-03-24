import * as React from 'react';
import { Button, Col, Layout, Row, Table, Spin, message } from 'antd';
import styled from 'styled-components';

import { HOME_SCREEN_LOG_TABLE_COL, HOME_SCREEN_TEMPLATE_TABLE_COL } from '../utils/constants';
import Step from '../components/Step';
import NaverIdTable from '../components/NaverIdTable';
import { useContext, useEffect, useState } from 'react';
import { RootContext, RunningStatus } from '../context/AppContext';
import { loginNaver, run } from '../ipc/renderer-IPC'
import { setNaverIdsOnDB, setWorkingsOnDB } from '../store/Store';
import RunSettingsModal from '../components/RunSettingsModal';
import WorkingTable from '../components/WorkingTable';

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
  const {
    naverIds,
    setNaverIds,
    templates,
    workings,
    setWorkings,
    logs,
    setting,
    runningStatus,
    setRunningStatus
  } = useContext(RootContext);
  const [loading, setLoading] = useState(true);
  const [showRunSettingsModal, setShowRunSettingsModal] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const result = await loginNaver(naverIds);
      // 실패한 아이디가 있을 경우
      console.log(result);
      if (result.length) {
        //TODO: alert
        console.log(
          '잘못된 아이디/패스워드입니다. ' +
            '직접 크롬이나 익스프로러 브라우저로 로그인을 진행 후 입력할 것을 권장드립니다. ' +
            '계속 다른 패스워드로 시도될 경우 아이피가 일정기간 막힐 가능성이 있습니다.'
        );
        const tempNaverIds = naverIds;
        for (let i = 0; i < result.length; i++) {
          const failNaverId = result[i];
          tempNaverIds.map(el => ({
            ...el,
            connection: el.id === failNaverId ? '로그인 실패' : '로그인 성공'
          }));
        }
        await setNaverIdsOnDB(tempNaverIds);
        setNaverIds(tempNaverIds);
      } else {
        const tempNaverIds = naverIds.map(el => ({ ...el, connection: '로그인 성공' }));
        setNaverIds(tempNaverIds);
        await setNaverIdsOnDB(tempNaverIds);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const stop = async () => {
    setRunningStatus({ status: RunningStatus.Stop });
  };

  const start = async () => {
    const shouldRunWorkings = workings.filter(el => el.shouldRun);
    // 체크된 작업 목록 있는지 확인
    const isWorkingExist = !!shouldRunWorkings.length;
    if (!isWorkingExist)
      return message.warn('작동할 체크된 작업이 없습니다. 작업목록에서 체크해주세요.');
    // 작업목록 validation (로그인 되어 있는지 확인)
    const shouldLoggedInIds = shouldRunWorkings.map(el => el.naverId);
    const isLoggedIn = !!naverIds.filter(
      el => shouldLoggedInIds.indexOf(el.id) > -1 && el.connection === '로그인 성공'
    ).length;
    if (!isLoggedIn) return message.warn('작업목록에 있는 아이디를 먼저 로그인 버튼을 눌러 로그인 시켜주세요.');

    // 시작
    await run(workings, templates, setting);
    setRunningStatus({ status: RunningStatus.Running });
  };

  return (
    <>
      <Spin tip="로딩 중 입니다..." spinning={loading}>
        <Header style={{ paddingLeft: 20, backgroundColor: '#003a70' }}>
          <Row>
            <Col span={16}>
              {runningStatus.status === RunningStatus.Stop ? (
                <S.HeaderButton type="primary" ghost onClick={start}>
                  시작
                </S.HeaderButton>
              ) : (
                <S.HeaderButton type="danger" ghost onClick={stop}>
                  정지
                </S.HeaderButton>
              )}
              <S.HeaderButton ghost onClick={() => setShowRunSettingsModal(!showRunSettingsModal)}>
                예약 동작 설정
              </S.HeaderButton>
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
            <S.TableCol span={8}>
              <NaverIdTable
                dataSource={naverIds}
                title={() => <Step text="네이버 ID" goto={'/setting-naver-id'} login={login} />}
              />
            </S.TableCol>
            <S.TableCol span={15}>
              <Table
                pagination={false}
                rowKey={'title'}
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
            <WorkingTable
              dataSource={workings}
              title={() => <Step text="작업 목록" goto={'/setting-working'} />}
              rowSelector={{
                selectedRowKeys: workings.filter(el => el.shouldRun).map(el => el.workingId),
                onChange: async (selectedRowKeys: any) => {
                  console.log(selectedRowKeys);
                  const newWorkings = workings.map(el => {
                    el.shouldRun = selectedRowKeys.indexOf(el.workingId) > -1;
                    return el;
                  });
                  await setWorkingsOnDB(newWorkings);
                  await setWorkings(newWorkings);
                }
              }}
            />
          </S.TableCol>
          <S.TableCol>
            <Table
              pagination={false}
              rowKey={'naverId'}
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
                emptyText: '데이터가 아직 없습니다.'
              }}
            />
          </S.TableCol>
        </Content>
        <RunSettingsModal
          visible={showRunSettingsModal}
          handleCancel={(_: any) => setShowRunSettingsModal(!showRunSettingsModal)}
        />
      </Spin>
    </>
  );
};

export default HomeScreen;
