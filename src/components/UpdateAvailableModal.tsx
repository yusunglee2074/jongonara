import * as React from 'react';
import { Button, Modal } from 'antd';
import { DownloadState, UpdateState } from '../screens/Home';
import { restartApp } from '../ipc/renderer-IPC';

interface IProps {
  updateModal: {
    showModal: boolean;
    updateState: UpdateState;
    downloadState: DownloadState;
  };
  setUpdateModal: Function;
}
const UpdateAvailableModal: React.FC<IProps> = ({ updateModal, setUpdateModal }) => {
  const restart = async () => {
    await restartApp();
  };

  return (
    <Modal
    visible={updateModal.showModal}
    title="업데이트 확인"
    cancelText={'확인'}
    okButtonProps={{ hidden: true }}
    >
      {updateModal.updateState === UpdateState.old
        ? '최신버전을 다운로드 중 입니다.'
        : '최신버전 다운로드가 완료 되었습니다.'}
      {updateModal.downloadState === DownloadState.downloaded && (
        <>
          <Button onClick={() => setUpdateModal({ ...updateModal, showModal: false })}>닫기</Button>
          <Button onClick={restart}>재시작</Button>
        </>
      )}
    </Modal>
  );
};

export default UpdateAvailableModal;
