import * as React from 'react';
import { Col, Row, Spin, Button, Radio, Checkbox, message } from 'antd';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getNaverCafes, getCafeBoards } from '../../../ipc/renderer-IPC';
import { IWorking } from '../../../store/Store';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import Search from 'antd/es/input/Search';

const S = {
  ContainerDiv: styled.div``,
  ContainerTitleP: styled.p`
    font-size: 1.9rem;
    font-weight: bold;
    margin-bottom: 1rem;
  `,
  SubtitleDiv: styled.div`
    margin-bottom: 1rem;
  `,
  SubtitleSpan: styled.span`
    font-size: 1.7rem;
    font-weight: bold;
    margin-right: 1rem;
  `,
  HeaderRow: styled(Row)`
    font-size: 2rem;
  `,
  BodyRow: styled(Row)`
    font-size: 1rem;
  `,
  Radio: styled(Radio)`
    display: block;
    height: 30px;
  `,
  BoardOptionRow: styled(Row)`
    min-width: 80rem;
  `
};

interface IProps {
  working: IWorking;
  setWorking: Function;
  cafeList: Array<any>;
  setCafeList: Function;
  boardList: Array<any>;
  setBoardList: Function;
}

const Tab2: React.FC<IProps> = ({
  working,
  setWorking,
  cafeList,
  setCafeList,
  boardList,
  setBoardList
}) => {
  const [loading, setLoading] = useState(false);
  const [searchCafeName, setSearchCafeName] = useState('');
  const [searchBoardName, setSearchBoardName] = useState('');

  useEffect(() => {
    const getCafe = async () => {
      try {
        await getCafeLists();
      } catch (e) {
        console.log(e);
      }
    };
    if (cafeList.length === 0) {
      getCafe();
    }
  }, []);

  const getCafeLists = async () => {
    setLoading(true);
    try {
      const cafes = await getNaverCafes(working.naverId);
      setCafeList(cafes);
    } catch (e) {
      console.log('야호');
    }
    setLoading(false);
  };

  const renderCafeList = () => {
    if (searchCafeName) {
      return cafeList
        .filter(el => el.name.indexOf(searchCafeName) > -1)
        .map(el => {
          return (
            <S.Radio value={el.name} key={el.url}>
              {el.name}
            </S.Radio>
          );
        });
    } else {
      return cafeList.map(el => {
        return (
          <S.Radio value={el.name} key={el.url}>
            {el.name}
          </S.Radio>
        );
      });
    }
  };

  const onCafeChange = async (e: RadioChangeEvent) => {
    setWorking({ ...working, boardNames: [] });
    const { url, name } = cafeList.find(el => el.name === e.target.value);

    setWorking({
      ...working,
      cafeName: name,
      cafeUrl: url
    });
    await getBoardLists(url);
  };

  const getBoardLists = async (url: string) => {
    setLoading(true);
    const cafeBoards: any[] = await getCafeBoards(working.naverId, url);
    setBoardList(cafeBoards);
    setLoading(false);
  };

  const onBoardChange = (checkedValues: any) => {
    const checkedObjs = boardList.filter(el => checkedValues.indexOf(el.url) > -1);
    let isExistTradeBoard = false;
    let isExistNormalBoard = false;
    for (let i = 0; i < checkedObjs.length; i++) {
      const item = checkedObjs[i];
      if (item.isTradeBoard) isExistTradeBoard = true;
      else isExistNormalBoard = true;
    }
    if (isExistTradeBoard && isExistNormalBoard) {
      message.warn('일반 게시판과 거래 게시판은 동시에 선택 할 수 없습니다.');
    } else {
      setWorking({
        ...working,
        boardNames: checkedObjs,
        isTrade: isExistTradeBoard
      });
    }
  };

  const renderOptions = () => {
    const filteredBoardList = boardList
      .filter(el => el.name.indexOf(searchBoardName) > -1)
      .sort((a, b) => (a.isTradeBoard && !b.isTradeBoard ? -1 : 1));

    return filteredBoardList.map(el => {
      return (
        <Col span={6}>
          <Checkbox value={el.url}>
            {el.name} ({el.isTradeBoard ? '거래게시판' : '일반게시판'})
          </Checkbox>
        </Col>
      );
    });
  };

  return (
    <S.ContainerDiv>
      <Spin tip="데이터를 가져오는 중 입니다." spinning={loading}>
        <S.HeaderRow>
          <Col span={20}>
            <S.ContainerTitleP>카페, 게시판 설정</S.ContainerTitleP>
          </Col>
        </S.HeaderRow>
        <S.BodyRow>
          <S.SubtitleDiv>
            <Row type="flex" style={{ alignItems: 'center' }}>
              <S.SubtitleSpan>카페 목록</S.SubtitleSpan>
              <Button type="primary" onClick={getCafeLists} shape="round">
                새로고침
              </Button>
            </Row>
          </S.SubtitleDiv>
          <div>
            <Search
              value={searchCafeName}
              placeholder="카페 명 필터링"
              onChange={(e: any) => setSearchCafeName(e.target.value)}
              style={{ width: 200, marginBottom: '0.5rem' }}
            />
          </div>
          <Radio.Group onChange={onCafeChange} value={working.cafeName}>
            {cafeList.length > 0 && renderCafeList()}
          </Radio.Group>
          <div></div>
          <S.SubtitleSpan>게시판 목록</S.SubtitleSpan>
          <div>
            <Search
              value={searchBoardName}
              placeholder="게시판 필터링"
              onChange={(e: any) => setSearchBoardName(e.target.value)}
              style={{ width: 200, marginBottom: '0.5rem' }}
            />
          </div>
          <Checkbox.Group value={working.boardNames.map(el => el.url)} onChange={onBoardChange}>
            <S.BoardOptionRow>{renderOptions()}</S.BoardOptionRow>
          </Checkbox.Group>
        </S.BodyRow>
      </Spin>
    </S.ContainerDiv>
  );
};

export default Tab2;
