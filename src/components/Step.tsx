import * as React from 'react'
import { Button, Row } from 'antd'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

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

export default Step;
