import * as React from 'react';
import { Button, Col, Layout, Row, Table, Spin, message, Modal, Radio } from 'antd';
import styled from 'styled-components';
import { isAfter } from 'date-fns';
import { remote } from 'electron';

import { APP_STRING, HOME_SCREEN_TEMPLATE_TABLE_COL } from '../utils/constants';
import Step from '../components/Step';
import NaverIdTable from '../components/NaverIdTable';
import { useContext, useEffect, useState } from 'react';
import { RootContext, RunningStatus } from '../context/AppContext';
import { allStop, getVersion, listenUpdateAvailable, loginNaver, run } from '../ipc/renderer-IPC';
import { ILog, setLogsOnDB, setNaverIdsOnDB, setWorkingsOnDB } from '../store/Store';
import RunSettingsModal from '../components/RunSettingsModal';
import WorkingTable from '../components/WorkingTable';
import LogTable from '../components/LogTable';
import { format } from 'date-fns';
import UpdateAvailableModal from '../components/UpdateAvailableModal';
import differenceInDays from 'date-fns/fp/differenceInDays';

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
    margin-right: 1rem;
  `,
  VersionSpan: styled.span`
    color: white;
  `
};

export enum UpdateState {
  'newest' = '최신버전',
  'old' = '이전버전'
}
export enum DownloadState {
  'downloading' = '다운로드 중',
  'downloaded' = '다운로드 완료'
}

const HomeScreen: React.FunctionComponent = () => {
  const {
    naverIds,
    setNaverIds,
    templates,
    workings,
    setWorkings,
    logs,
    setLogs,
    setting,
    runningStatus,
    setRunningStatus,
    setAuthenticated,
    userInfo
  } = useContext(RootContext);
  const [loading, setLoading] = useState(true);
  const [showRunSettingsModal, setShowRunSettingsModal] = useState(false);
  const [version, setVersion] = useState('');
  const [updateModal, setUpdateModal] = useState({
    showModal: false,
    updateState: UpdateState.newest,
    downloadState: DownloadState.downloaded
  });

  useEffect(() => {
    const getCurrentVersion = async () => {
      setVersion(await getVersion());
    };
    setLoading(false);
    (async () => await getCurrentVersion())();

    listenUpdateAvailable(
      () => {
        message.warn('콜백1');
        setUpdateModal({
          showModal: true,
          updateState: UpdateState.old,
          downloadState: DownloadState.downloading
        });
      },
      () => {
        message.warn('콜백2');
        setUpdateModal({
          showModal: true,
          updateState: UpdateState.old,
          downloadState: DownloadState.downloaded
        });
      }
    );
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const result = await loginNaver(naverIds);
      // 실패한 아이디가 있을 경우
      console.log(result);
      if (result.length) {
        message.warn(
          result.join(', ') + '아이디 패스워드가 일치하지 않습니다. 다시한번 확인해주세요.'
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
      console.log(Object.keys(e));
    }
    setLoading(false);
  };

  const stopRunning = async () => {
    setRunningStatus({ status: RunningStatus.Stop });
    await allStop();
  };

  const start = async () => {
    const shouldRunWorkings = workings.filter(el => el.shouldRun);
    // 체크된 작업 목록 있는지 확인
    const isWorkingExist = !!shouldRunWorkings.length;
    if (!isWorkingExist)
      return message.warn('작동할 체크된 작업이 없습니다. 작업목록에서 체크해주세요.');
    if (shouldRunWorkings.filter(el => el.naverId === APP_STRING.deletedId).length > 0) {
      return message.warn('삭제된 아이디가 포함되어있는 작업이 있습니다.');
    }
    // 작업목록 validation (로그인 되어 있는지 확인)
    const shouldLoggedInIds = shouldRunWorkings.map(el => el.naverId);
    const isLoggedIn = !!naverIds.filter(
      el => shouldLoggedInIds.indexOf(el.id) > -1 && el.connection === '로그인 성공'
    ).length;
    if (!isLoggedIn)
      return message.warn('작업목록에 있는 아이디를 먼저 로그인 버튼을 눌러 로그인 시켜주세요.');

    // 시작
    const logging = async (newLogs: [ILog]) => {
      await setLogs(
        newLogs.sort((a, b) => (isAfter(new Date(a.createdAt), new Date(b.createdAt)) ? -1 : 1))
      );
    };
    await run(shouldRunWorkings, templates, setting, logging);
    setRunningStatus({ status: RunningStatus.Running });
  };

  const changeId = async (workingId: string) => {
    const onChange = (e: any) => {
      setWorkings(
        workings.map(el => {
          const naverId = e.target.value;
          if (el.workingId === workingId) {
            return { ...el, naverId };
          } else {
            return el;
          }
        })
      );
    };
    Modal.info({
      title: '변경하실 아이디를 선택해주세요.',
      content: (
        <Radio.Group onChange={onChange}>
          {naverIds.length === 0 && <p>먼저 아이디를 추가해주세요.</p>}
          {naverIds.map((el, idx) => {
            return (
              <Radio value={el.id} key={idx}>
                {el.id}
              </Radio>
            );
          })}
        </Radio.Group>
      ),
      onOk() {},
      okText: '확인'
    });
  };

  const deleteLogs = async () => {
    await setLogsOnDB([]);
    setLogs([]);
  };

  const logout = async () => {
    setAuthenticated(false);
  };

  const goURL = async (e: any) => {
    e.preventDefault();
    await remote.shell.openExternal(e.target.href);
  };

  return (
    <>
      <Spin tip="로그인 중 입니다..." spinning={loading}>
        <Header style={{ paddingLeft: 20, backgroundColor: '#003a70' }}>
          <Row>
            <Col span={16}>
              {runningStatus.status === RunningStatus.Stop ? (
                <S.HeaderButton type="primary" ghost onClick={start}>
                  시작
                </S.HeaderButton>
              ) : (
                <S.HeaderButton type="danger" ghost onClick={stopRunning}>
                  정지
                </S.HeaderButton>
              )}
              <S.HeaderButton ghost onClick={() => setShowRunSettingsModal(!showRunSettingsModal)}>
                동작 설정
              </S.HeaderButton>
            </Col>
            <Col span={8}>
              <S.HeaderSpan>
                남은 사용기간{' '}
                {differenceInDays(new Date(), new Date(userInfo.expirationDate)) <= 0 ? (
                  <span style={{ color: 'red' }}>만료</span>
                ) : (
                  differenceInDays(new Date(), new Date(userInfo.expirationDate)) + '일'
                )}
              </S.HeaderSpan>
              <S.HeaderButton type="danger" ghost={true} onClick={logout}>
                로그아웃
              </S.HeaderButton>
              <S.VersionSpan>버전: {version}</S.VersionSpan>
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
                selectedRowKeys: workings
                  .filter(el => el.shouldRun && el.naverId !== APP_STRING.deletedId)
                  .map(el => el.workingId),
                onChange: async (selectedRowKeys: any) => {
                  const newWorkings = workings.map(el => {
                    el.shouldRun = selectedRowKeys.indexOf(el.workingId) > -1;
                    return el;
                  });
                  await setWorkingsOnDB(newWorkings);
                  await setWorkings(newWorkings);
                }
              }}
              extraCols={[
                {
                  title: '아이디 변경',
                  render: (_: any, record: any) => {
                    const { naverId } = record;
                    if (naverId === APP_STRING.deletedId) {
                      return <Button onClick={() => changeId(record.workingId)}>수정</Button>;
                    } else {
                      return;
                    }
                  }
                }
              ]}
            />
          </S.TableCol>
          <S.TableCol>
            <LogTable
              dataSource={logs}
              title={() => (
                <>
                  <S.StepTitleSpan>작업 로그</S.StepTitleSpan>
                  <Button icon="delete" onClick={deleteLogs} />
                </>
              )}
              extraCols={[
                {
                  title: '시간',
                  width: 120,
                  order: 1,
                  render: (_: any, record: any) => {
                    const { createdAt } = record;
                    return format(new Date(createdAt), 'yy/MM/dd HH:mm');
                  }
                },
                {
                  title: 'url',
                  render: (_: any, record: any) => {
                    const { url } = record;
                    return (
                      <a href={url} target="_blank" onClick={goURL}>
                        {url}
                      </a>
                    );
                  },
                  width: 170
                }
              ]}
            />
          </S.TableCol>
        </Content>
        <RunSettingsModal
          visible={showRunSettingsModal}
          handleCancel={(_: any) => setShowRunSettingsModal(!showRunSettingsModal)}
        />
        <UpdateAvailableModal updateModal={updateModal} />
      </Spin>
    </>
  );
};

export default HomeScreen;
