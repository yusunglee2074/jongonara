import * as React from 'react'
import { Col, Row, Spin, Button, Radio, Checkbox, message } from 'antd'
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { getNaverCafes, getCafeBoards } from '../../../ipc/renderer-IPC'
import { IWorking } from '../../../store/Store'
import { RadioChangeEvent } from 'antd/lib/radio/interface'

const S = {
  ContainerDiv: styled.div`
  `,
  ContainerTitleP: styled.p`
    font-size: 1.3rem;
    font-weight: bold;
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
    lineheight: 30px;
  `,
}

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
                                  setBoardList,
                                }) => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getCafe = async () => {
      try {
        await getCafeLists()
      } catch (e) {
        console.log(e)
      }
    }
    if (cafeList.length === 0) {
      getCafe()
    }
  }, [])

  const getCafeLists = async () => {
    setLoading(true)
    try {
      const cafes = await getNaverCafes(working.naverId)
      setCafeList(cafes)
    } catch (e) {
      console.log('야호')
    }
    setLoading(false)
  }

  const renderCafeList = () => {
    return cafeList.map(el => {
      return (
        <S.Radio value={el.name} key={el.url}>
          {el.name}
        </S.Radio>
      )
    })
  }

  const onCafeChange = async (e: RadioChangeEvent) => {
    setWorking({ ...working, boardNames: [] })
    const { url, name } = cafeList.find(el => el.name === e.target.value)

    setWorking({
      ...working,
      cafeName: name,
      cafeUrl: url,
    })
    await getBoardLists(url)
  }

  const getBoardLists = async (url: string) => {
    setLoading(true)
    const cafeBoards: any[] = await getCafeBoards(working.naverId, url)
    setBoardList(cafeBoards)
    setLoading(false)
  }

  const onBoardChange = (checkedValues: any) => {
    const checkedObjs = boardList.filter(el => checkedValues.indexOf(el.url) > -1)
    let isExistTradeBoard = false
    let isExistNormalBoard = false
    for (let i = 0; i < checkedObjs.length; i++) {
      const item = checkedObjs[i]
      if (item.isTradeBoard) isExistTradeBoard = true
      else isExistNormalBoard = true
    }
    if (isExistTradeBoard && isExistNormalBoard) {
      message.warn('일반 게시판과 거래 게시판은 동시에 선택 할 수 없습니다.')
    } else {
      setWorking({
        ...working,
        boardNames: checkedObjs,
        isTrade: isExistTradeBoard,
      })
    }
  }

  return (
    <S.ContainerDiv>
      <Spin tip="데이터를 가져오는 중 입니다." spinning={loading}>
        <S.HeaderRow>
          <Col span={20}>
            <S.ContainerTitleP>카페, 게시판 설정</S.ContainerTitleP>
          </Col>
        </S.HeaderRow>
        <S.BodyRow>
          <p>
            카페목록 <Button onClick={getCafeLists}>다시 가져오기</Button>
          </p>
          <Radio.Group onChange={onCafeChange} value={working.cafeName}>
            {cafeList.length > 0 && renderCafeList()}
          </Radio.Group>
          <p>게시판 목록</p>
          <p>* 해당 아이디가 글쓰기 권한이 있는지 확인 후 작업해주세요.</p>
          <Checkbox.Group
            options={boardList.map(el => {
              return {
                label: el.name + (el.isTradeBoard ? '(거래)' : '(일반)'),
                value: el.url,
              }
            })}
            value={working.boardNames.map(el => el.url)}
            onChange={onBoardChange}
          />
        </S.BodyRow>
      </Spin>
    </S.ContainerDiv>
  )
}

export default Tab2
