import * as React from 'react';
import { Button, Col, Row } from 'antd';
import styled from 'styled-components';
import { ISetting } from '../store/Store'

const S = {
  ButtonRow: styled(Row)`
    margin-bottom: 0.5rem;
  `
};
interface IProps {
  labels: Array<string>;
  onClick: Function;
  setting: ISetting;
}
const SettingRunTimeButtonRows: React.FC<IProps> = ({ labels, onClick, setting}) => {
  return (
    <S.ButtonRow justify="space-around">
      <Col span={8}>
        <Button type={setting.runTimes[labels[0].slice(0, 2)] ? 'primary' : 'default'} onClick={() => onClick(labels[0])}>
          {labels[0]}
        </Button>
      </Col>
      <Col span={8}>
        <Button type={setting.runTimes[labels[1].slice(0, 2)] ? 'primary' : 'default'} onClick={() => onClick(labels[1])}>
          {labels[1]}
        </Button>
      </Col>
      <Col span={8}>
        <Button type={setting.runTimes[labels[2].slice(0, 2)] ? 'primary' : 'default'} onClick={() => onClick(labels[2])}>
          {labels[2]}
        </Button>
      </Col>
    </S.ButtonRow>
  );
};


export default SettingRunTimeButtonRows;
