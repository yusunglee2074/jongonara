import * as React from 'react';
import { Modal } from 'antd';
import { useContext } from 'react';
import { RootContext } from '../context/AppContext';
import SettingRunTimeButtonRows from './SettingRunTimeButtonRow';
import { setSettingsOnDB } from '../store/Store';

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

  return (
    <Modal
      title="예약 동작 설정"
      visible={visible}
      onCancel={handleCancel}
      cancelText={'확인'}
      okButtonProps={{ hidden: true }}
    >
      <p>작동시간</p>
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
    </Modal>
  );
};

export default RunSettingsModal;
