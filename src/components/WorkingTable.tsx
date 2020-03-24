import * as React from 'react';
import { Table } from 'antd';
import { HOME_SCREEN_WORKING_TABLE_COL } from '../utils/constants';
import { ReactNode } from 'react';
import { IWorking } from '../store/Store';

interface IProps {
  title?: () => ReactNode;
  extraCols?: Array<object>;
  dataSource?: Array<IWorking>;
  rowSelector?: object;
}

const WorkingTable: React.FC<IProps> = ({
  title,
  extraCols = [],
  dataSource = [],
  rowSelector = {}
}) => {
  return (
    <Table
      pagination={false}
      rowKey={'workingId'}
      columns={[...HOME_SCREEN_WORKING_TABLE_COL, ...extraCols]}
      dataSource={dataSource}
      scroll={{
        x: true,
        y: true
      }}
      bordered={true}
      size={'small'}
      title={title}
      locale={{
        emptyText: '최소 하나의 데이터를 넣어주세요.'
      }}
      rowSelection={{
        type: 'checkbox',
        ...rowSelector,
      }}
    />
  );
};

export default WorkingTable;
