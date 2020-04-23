import * as React from 'react';
// @ts-ignore
import ChatBot from 'react-simple-chatbot';
import { useState } from 'react';
import FloatingButton from './FloatingButton';
import styled from 'styled-components';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons/lib';

const S = {
  FloatingChatDiv: styled.div`
    z-index: 100;
    position: fixed;
    right: 1rem;
    bottom: 1rem;
  `,
  CloseButton: styled(Button)`
    z-index: 1000;
    position: absolute;
    right: 1rem;
    top: 0.8rem;
  `
};

const Chatting: React.FunctionComponent<{}> = () => {
  const [showChat, setShowChat] = useState(false);
  console.log(setShowChat);

  const steps = [
    {
      id: '1',
      message: '반갑습니다. 빠른 답변을 위해 노력 하겠습니다. 아래 메뉴를 선택해주세요.',
      trigger: '2',
    },
    {
      id: '2',
      options: [
        { value: '이용문의', label: 'Number 1', trigger: 'contact' },
        { value: '버그/에러 문의', label: 'Number 2', trigger: 'bug' },
        { value: '개발 의뢰', label: 'Number 3', trigger: 'request' },
      ],
    },
    {
      id: 'contact',
      message: '반갑습니다. 빠른 답변을 위해 노력 하겠습니다. 아래 메뉴를 선택해주세요.',
      trigger: '2',
    },
  ]

  return (
    <>
      {showChat ? (
        <S.FloatingChatDiv>
          <S.CloseButton ghost onClick={() => setShowChat(false)}>
            <CloseOutlined />
          </S.CloseButton>
          <ChatBot
            steps={steps}
          />
        </S.FloatingChatDiv>
      ) : (
        <FloatingButton toggleShowChat={() => setShowChat(!showChat)} />
      )}
    </>
  );
};

export default Chatting;
