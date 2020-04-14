import * as React from 'react';
import { Checkbox, Col, Modal, Row, Select } from 'antd';
import { useContext } from 'react';
import { RootContext } from '../context/AppContext';
import SettingRunTimeButtonRows from './SettingRunTimeButtonRow';
import { setSettingsOnDB } from '../store/Store';
import styled from 'styled-components';

const { Option } = Select;

const S = {
  MenuTitleP: styled.p`
    margin-top: 0rem;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  `
};

interface IProps {
  visible: boolean;
  handleCancel: (e: any) => void;
}

const RunSettingsModal: React.FC<IProps> = ({ visible, handleCancel }) => {
  const { setting, setSetting } = useContext(RootContext);

  const onClick = async (label: string) => {
    const index = label.slice(0, 2);
    const currentSetting: boolean = setting.runTimes[index];
    const newSetting = { ...setting, runTimes: { ...setting.runTimes, [index]: !currentSetting } };
    setSetting(newSetting);
    await setSettingsOnDB(newSetting);
  };

  const handleMinutesChange = async (value: number) => {
    setSetting({ ...setting, minPerWrite: value });
    await setSettingsOnDB({ ...setting, minPerWrite: value });
  };

  const onDebugModeChange = async (e: any) => {
    setSetting({ ...setting, debugMode: e.target.checked });
    await setSettingsOnDB({ ...setting, debugMode: e.target.checked });
  };

  const onSpamModeChange = async (e: any) => {
    setSetting({ ...setting, spamMode: e.target.checked });
    await setSettingsOnDB({ ...setting, spamMode: e.target.checked });
  };

  return (
    <Modal
      title="동작 설정"
      visible={visible}
      onCancel={handleCancel}
      cancelText={'확인'}
      okButtonProps={{ hidden: true }}
    >
      <Row>
        <Col>
          <S.MenuTitleP>최소 글쓰기 간격</S.MenuTitleP>
        </Col>
        <Col>
          <Select
            defaultValue={setting.minPerWrite ? setting.minPerWrite : 10}
            style={{ width: 120, marginBottom: '1rem' }}
            onChange={handleMinutesChange}
          >
            <Option value={5}>5분</Option>
            <Option value={10}>10분</Option>
            <Option value={15}>15분</Option>
            <Option value={20}>20분</Option>
            <Option value={30}>30분</Option>
            <Option value={60}>1시간</Option>
            <Option value={120}>2시간</Option>
          </Select>
        </Col>
      </Row>
      <S.MenuTitleP>작동시간</S.MenuTitleP>
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['00시(오전) ~ 01시', '01시 ~ 02시', '02시 ~ 03시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['03시 ~ 04시', '04시 ~ 05시', '05시 ~ 06시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['06시 ~ 07시', '07시 ~ 08시', '08시 ~ 09시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['09시 ~ 10시', '10시 ~ 11시', '11시 ~ 12시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['12시(정오) ~ 13시', '13시 ~ 14시', '14시 ~ 15시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['15시 ~ 16시', '16시 ~ 17시', '17시 ~ 18시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['18시 ~ 19시', '19시 ~ 20시', '20시 ~ 21시']}
      />
      <SettingRunTimeButtonRows
        onClick={onClick}
        setting={setting}
        labels={['21시 ~ 22시', '22시 ~ 23시', '23시 ~ 24시']}
      />
      <Checkbox defaultChecked={setting.spamMode} onChange={onSpamModeChange} disabled>
        <span>도배방지 모드</span>
      </Checkbox>
      <p>
        해당 게시판 내 당일 글 4개 이상일 시 가장 일찍 올린 게시글을 지우고 작성합니다.
        곧 업데이트 예정
      </p>
      <Checkbox defaultChecked={setting.debugMode} onChange={onDebugModeChange}>
        <span style={{ color: 'red' }}>디버그 모드</span>
      </Checkbox>
      <p>
        백그라운드에서 작동하는 일련의 과정을 볼 수 있습니다. 에러 체크 외에는 사용 할 필요
        없습니다.
      </p>
      <p>변경 후에는 다시 로그인을 해야 적용됩니다.</p>
    </Modal>
  );
};

export default RunSettingsModal;
