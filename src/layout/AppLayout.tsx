import * as React from 'react';
import { useState } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import NaverIdScreen from '../screens/settings/NaverIdScreen'
import TemplateScreen from '../screens/settings/templates/TemplateScreen'
import WorkingScreen from '../screens/settings/workings/WorkingScreen'
import ContactScreen from '../screens/contact/ContactScreen'
import ProfileScreen from '../screens/profile/ProfileScreen'
import HomeScreen from '../screens/Home'
import TradeTemplateWriteScreen from '../screens/settings/templates/TradeTemplateWriteScreen'
import NormalTemplateWriteScreen from '../screens/settings/templates/NormalTemplateWriteScreen'
import WorkingWriteScreen from '../screens/settings/workings/WorkingWriteScreen'

const { Sider } = Layout;

const sideMenuArr = [
  { text: '메인 대시보드', iconType: 'home', goto: '/' },
  { text: '네이버 아이디 설정', iconType: 'user', goto: '/setting-naver-id' },
  { text: '작성 글 템플릿 설정', iconType: 'file-text', goto: '/setting-template' },
  { text: '작업 설정', iconType: 'play-circle', goto: '/setting-working' },
  { text: '결제/연장', iconType: 'setting', goto: '/profile' },
  { text: '건의/문의사항', iconType: 'alert', goto: '/contact' }
];

const AppLayout: React.FunctionComponent<RouteComponentProps> = ({ location }) => {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible={true} collapsed={collapsed} onCollapse={onCollapse}>
        <div className="logo" />
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          defaultSelectedKeys={['/']}
          mode="inline"
        >
          {sideMenuArr.map(item =>
            SideMenuItem({ text: item.text, iconType: item.iconType, goto: item.goto })
          )}
        </Menu>
      </Sider>
      <Layout>
        <Switch>
          <Route path="/setting-naver-id" component={NaverIdScreen} />
          <Route path="/setting-template-trade-write" component={TradeTemplateWriteScreen} />
          <Route path="/setting-template-normal-write" component={NormalTemplateWriteScreen} />
          <Route path="/setting-template" component={TemplateScreen} />
          <Route path="/setting-working-write" component={WorkingWriteScreen} />
          <Route path="/setting-working" component={WorkingScreen} />
          <Route path="/contact" component={ContactScreen} />
          <Route path="/profile" component={ProfileScreen} />
          <Route path="/" component={HomeScreen} />
        </Switch>
      </Layout>
    </Layout>
  );
};

interface ISideMenuItemProps {
  iconType: string;
  text: string;
  goto: string;
}

const SideMenuItem = ({ iconType, text, goto }: ISideMenuItemProps) => {
  return (
    <Menu.Item key={goto}>
      <Link to={goto}>
        <Icon type={iconType} />
        <span>{text}</span>
      </Link>
    </Menu.Item>
  );
};

export default withRouter(AppLayout);
