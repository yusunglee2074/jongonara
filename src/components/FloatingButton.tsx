import * as React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';

const S = {
  FixedDiv: styled.div`
    z-index: 100;
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    .ant-btn-primary {
      background: rgb(110, 76, 168);
      border-color: white;
    }
  `,
  FixedButton: styled(Button)`
    padding: 1rem;
    font-weight: bold;
  `
};

const FloatingButton: React.FunctionComponent<{ toggleShowChat: Function }> = ({
  toggleShowChat
}) => {
  return (
    <S.FixedDiv>
      <S.FixedButton type="primary" shape="round" size="large" onClick={() => toggleShowChat()}>
        <span>문의/상담</span>
      </S.FixedButton>
    </S.FixedDiv>
  );
};

export default FloatingButton;
