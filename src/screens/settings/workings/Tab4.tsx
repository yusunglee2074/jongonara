import * as React from 'react';
import { Checkbox, Col, Row, Select } from 'antd';
import styled from 'styled-components';
import { IWorking } from '../../../store/Store';

const { Option } = Select;

const S = {
  ContainerDiv: styled.div`
    padding: 1rem;
  `,
  ContainerTitleP: styled.p`
    font-size: 1.3rem;
    font-weight: bold;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 2rem;
  `,
  BoardNameP: styled.p`
    font-size: 1rem;
    margin: 0;
  `
};

interface IProps {
  working: IWorking;
  setWorking: Function;
}

const Tab4: React.FC<IProps> = ({ working, setWorking }) => {

  const handleMinutesChange = (value: string) => {
    setWorking({ ...working, minPerWrite: value });
  };

  return (
    <S.ContainerDiv>
      <S.HeaderRow>
        <Col span={20}>
          <S.ContainerTitleP>기타 셋팅 설정</S.ContainerTitleP>
        </Col>
      </S.HeaderRow>
      <S.BodyRow>
        <p>네이버 아이디 {working.naverId}</p>
        <p>카페 이름 {working.cafeName}</p>
        <p>게시판 목록</p>
        {working.boardNames.map((el, idx) => (
          <S.BoardNameP key={idx}>{el.name + (el.isTradeBoard ? '(거래)' : '(일반)')}</S.BoardNameP>
        ))}
        <p>템플릿 제목 {working.templateTitle}</p>
        <p>작동 설정</p>
        <p>최소 글쓰기 간격</p>
        <Select
          defaultValue={working.minPerWrite ? working.minPerWrite.toString() : '10'}
          style={{ width: 120 }}
          onChange={handleMinutesChange}
        >
          <Option value="10">10분</Option>
          <Option value="15">15분</Option>
          <Option value="20">20분</Option>
          <Option value="30">30분</Option>
          <Option value="60">1시간</Option>
          <Option value="120">2시간</Option>
        </Select>
        <p>
          도배 방지 설정
          <Checkbox
            checked={working.checkFourBoards}
            onChange={e => setWorking({ ...working, checkFourBoards: e.target.checked })}
          />
        </p>
        <span>
          * 해당 옵션을 사용할 경우 게시판별 작성글이 4개가 초과 될 떄마다 오늘 가장 먼저 작성한
          글을 삭제 후 작성합니다.
        </span>
      </S.BodyRow>
    </S.ContainerDiv>
  );
};

export default Tab4;
