import * as React from 'react';
import { Table } from 'antd';
import { HOME_SCREEN_LOG_TABLE_COL } from '../utils/constants';
import { ReactNode } from 'react';
import { ILog } from '../store/Store';

interface IProps {
  title?: () => ReactNode;
  extraCols?: Array<object>;
  dataSource?: Array<ILog>;
}

const LogTable: React.FC<IProps> = ({
  title,
  extraCols = [],
  dataSource = [],
}) => {
  return (
    <Table
      pagination={false}
      rowKey="createdAt"
      columns={[...HOME_SCREEN_LOG_TABLE_COL, ...extraCols]}
      dataSource={dataSource}
      scroll={{
        x: true,
        y: true
      }}
      bordered={true}
      size={'small'}
      title={title}
      locale={{
        emptyText: '로그가 없습니다.'
      }}
    />
  );
};

export default LogTable;
