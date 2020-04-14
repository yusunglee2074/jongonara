export const HOME_SCREEN_NAVER_ID_TABLE_COL: Array<object> = [
  {
    title: '아이디',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '접속 상태',
    dataIndex: 'connection',
    key: 'connection',
  }
];

export const HOME_SCREEN_CAFE_TABLE_COL: Array<object> = [
  {
    title: '네이버 아이디',
    dataIndex: 'naverId',
    key: 'naverId'
  },
  {
    title: '카페 이름',
    dataIndex: 'cafeName',
    key: 'cafeName'
  },
  {
    title: '게시판 이름',
    dataIndex: 'boardName',
    key: 'boardName'
  }
];

export const HOME_SCREEN_TEMPLATE_TABLE_COL: Array<object> = [
  {
    title: '타입',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '제목',
    dataIndex: 'title',
    key: 'title'
  },
];

export const HOME_SCREEN_WORKING_TABLE_COL: Array<object> = [
  {
    title: '작성자 아이디',
    dataIndex: 'naverId',
    key: 'naverId',
  },
  {
    title: '카페 이름',
    dataIndex: 'cafeName',
    key: 'cafeName'
  },
  {
    title: '게시판 목록',
    dataIndex: 'boardNames',
    key: 'boardNames',
    render: (_: any, record: any) => {
      return record.boardNames.map((el:any) => el.name).join(', ')
    }
  },
  {
    title: '템플릿 제목',
    dataIndex: 'templateTitle',
    key: 'templateTitle'
  },
];

export const APP_STRING = {
  deletedId: '삭제된 아이디',
}
export const HOME_SCREEN_LOG_TABLE_COL: Array<object> = [
  {
    title: '타입',
    dataIndex: 'type',
    key: 'type',
    width: 50,
    order: 2,
  },
  {
    title: '네이버아이디',
    dataIndex: 'naverId',
    key: 'naverId',
    width: 120,
  },
  {
    title: '내용',
    dataIndex: 'text',
    key: 'text'
  },
  {
    title: '카페명',
    dataIndex: 'cafeName',
    key: 'cafeName',
  },
];

export const PUPPETEER_BROWSER_OPTIONS_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
  '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
  '--disable-extensions'
];




