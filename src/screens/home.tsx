import * as React from 'react';
import { Button, Col, Layout, Row, Table } from 'antd';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import {
  HOME_SCREEN_CAFE_TABLE_COL,
  HOME_SCREEN_LOG_TABLE_COL,
  HOME_SCREEN_NAVER_ID_TABLE_COL,
  HOME_SCREEN_TEMPLATE_TABLE_COL,
  HOME_SCREEN_WORKING_TABLE_COL
} from '../constants';

const { Header, Content } = Layout;

const S = {
  StepDiv: styled.div`
    vertical-align: middle;
  `,
  StepTitleSpan: styled.span`
    font-size: 1.7rem;
  `,
  StepSettingA: styled.a`
    font-size: 1rem;
  `,
  StepLink: styled(Link)`
    margin-left: 1rem;
  `,
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
  `
};

const HomeScreen: React.FunctionComponent = () => {
  return (
    <>
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
          <S.TableCol span={5}>
            <Table
              columns={HOME_SCREEN_NAVER_ID_TABLE_COL}
              dataSource={[]}
              scroll={{
                x: true,
                y: true
              }}
              bordered={true}
              size={'small'}
              title={() => <Step text="네이버 ID" goto={'/setting/naver-id'} />}
              locale={{
                emptyText: '데이터 없음'
              }}
            />
          </S.TableCol>
          <S.TableCol span={9}>
            <Table
              columns={HOME_SCREEN_CAFE_TABLE_COL}
              dataSource={[]}
              scroll={{
                x: true,
                y: true
              }}
              bordered={true}
              size={'small'}
              title={() => <Step text="카페, 게시판" goto={'/setting/naver-cafe'} />}
              locale={{
                emptyText: '데이터 없음'
              }}
            />
          </S.TableCol>
          <S.TableCol span={9}>
            <Table
              columns={HOME_SCREEN_TEMPLATE_TABLE_COL}
              dataSource={[]}
              bordered={true}
              scroll={{
                x: true,
                y: true
              }}
              size={'small'}
              title={() => <Step text="작성 글 템플릿" goto={'/setting/template'} />}
              locale={{
                emptyText: '데이터 없음'
              }}
            />
          </S.TableCol>
        </Row>
        <S.TableCol>
          <Table
            columns={HOME_SCREEN_WORKING_TABLE_COL}
            dataSource={[]}
            bordered={true}
            scroll={{
              x: true,
              y: true
            }}
            size={'small'}
            title={() => <Step text="작업 설정" goto={'/setting/working'} />}
            locale={{
              emptyText: '데이터 없음'
            }}
          />
        </S.TableCol>
        <S.TableCol>
          <Table
            columns={HOME_SCREEN_LOG_TABLE_COL}
            dataSource={[]}
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
              emptyText: '데이터 없음'
            }}
          />
        </S.TableCol>
      </Content>
    </>
  );
};

const Step: React.FunctionComponent<{
  text: string;
  goto: string;
}> = ({ text, goto }) => {
  return (
    <S.StepDiv>
      <Row type="flex" style={{ alignItems: 'center' }}>
        <S.StepTitleSpan>{text}</S.StepTitleSpan>
        <S.StepLink to={goto}>
          <Button icon="setting" />
        </S.StepLink>
      </Row>
    </S.StepDiv>
  );
};

export default HomeScreen;
