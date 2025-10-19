import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  RiseOutlined,
  FireOutlined,
} from '@ant-design/icons';

const Dashboard = () => {
  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalUsers: 1247,
    activeTrainers: 89,
    todayWorkouts: 342,
    platformGrowth: 23.5,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-neutral-charcoal">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#0891b2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Trainers"
              value={stats.activeTrainers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#2dd4bf' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Workouts"
              value={stats.todayWorkouts}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#00ffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Growth Rate"
              value={stats.platformGrowth}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="User Engagement" className="h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Daily Active Users</span>
                  <span className="text-sm font-semibold">78%</span>
                </div>
                <Progress percent={78} strokeColor="#00ffff" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Weekly Active Users</span>
                  <span className="text-sm font-semibold">92%</span>
                </div>
                <Progress percent={92} strokeColor="#0891b2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Monthly Active Users</span>
                  <span className="text-sm font-semibold">85%</span>
                </div>
                <Progress percent={85} strokeColor="#2dd4bf" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Platform Health" className="h-full">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Server Uptime</span>
                  <span className="text-sm font-semibold">99.8%</span>
                </div>
                <Progress percent={99.8} strokeColor="#10b981" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">API Response Time</span>
                  <span className="text-sm font-semibold">145ms</span>
                </div>
                <Progress percent={95} strokeColor="#00ffff" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Storage Usage</span>
                  <span className="text-sm font-semibold">62%</span>
                </div>
                <Progress percent={62} strokeColor="#f59e0b" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Placeholder Notice */}
      <Card className="mt-6 bg-neutral-ice border-primary">
        <div className="text-center py-4">
          <p className="text-neutral-charcoal font-semibold mb-2">
            📊 Dashboard Placeholder
          </p>
          <p className="text-sm text-neutral-medium">
            This is a placeholder dashboard with mock data. Real-time data integration
            and advanced analytics will be implemented in future milestones.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
