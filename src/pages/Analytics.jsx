import { Card, Row, Col, Statistic, Select } from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const Analytics = () => {
  // Mock data for charts
  const userGrowthData = [
    { month: 'Jan', users: 450 },
    { month: 'Feb', users: 620 },
    { month: 'Mar', users: 780 },
    { month: 'Apr', users: 920 },
    { month: 'May', users: 1050 },
    { month: 'Jun', users: 1247 },
  ];

  const workoutData = [
    { day: 'Mon', workouts: 145 },
    { day: 'Tue', workouts: 178 },
    { day: 'Wed', workouts: 192 },
    { day: 'Thu', workouts: 165 },
    { day: 'Fri', workouts: 203 },
    { day: 'Sat', workouts: 287 },
    { day: 'Sun', workouts: 312 },
  ];

  const categoryData = [
    { name: 'Strength', value: 35 },
    { name: 'Cardio', value: 28 },
    { name: 'Yoga', value: 18 },
    { name: 'HIIT', value: 12 },
    { name: 'Other', value: 7 },
  ];

  const COLORS = ['#00ffff', '#0891b2', '#2dd4bf', '#06b6d4', '#0e7490'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-charcoal">
          Analytics & Insights
        </h1>
        <Select
          defaultValue="7days"
          style={{ width: 150 }}
          options={[
            { value: '7days', label: 'Last 7 Days' },
            { value: '30days', label: 'Last 30 Days' },
            { value: '90days', label: 'Last 90 Days' },
            { value: 'year', label: 'This Year' },
          ]}
        />
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue (Mock)"
              value={45280}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#10b981' }}
              suffix={
                <span className="text-sm text-status-success">
                  <ArrowUpOutlined /> 12%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg. Session Time"
              value={32}
              suffix="min"
              valueStyle={{ color: '#0891b2' }}
              prefix={
                <span className="text-sm text-status-success">
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={87.3}
              suffix="%"
              valueStyle={{ color: '#00ffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Churn Rate"
              value={4.2}
              suffix="%"
              valueStyle={{ color: '#ef4444' }}
              prefix={
                <span className="text-sm text-status-error">
                  <ArrowDownOutlined /> 2%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* User Growth Chart */}
        <Col xs={24} lg={12}>
          <Card title="User Growth (Last 6 Months)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#00ffff"
                  strokeWidth={3}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Weekly Workouts */}
        <Col xs={24} lg={12}>
          <Card title="Workouts This Week">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="workouts" fill="#0891b2" name="Completed Workouts" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Workout Categories */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Workout Category Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Top Performing Trainers (Mock)">
            <div className="space-y-4">
              {[
                { name: 'Sarah Williams', clients: 42, rating: 4.9 },
                { name: 'Carlos Martinez', clients: 38, rating: 4.8 },
                { name: 'Emily Chen', clients: 35, rating: 4.7 },
                { name: 'David Lee', clients: 28, rating: 4.9 },
                { name: 'Anna Rodriguez', clients: 25, rating: 4.6 },
              ].map((trainer, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-neutral-ice rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{trainer.name}</p>
                    <p className="text-sm text-neutral-medium">
                      {trainer.clients} clients
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">⭐ {trainer.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Placeholder Notice */}
      <Card className="mt-6 bg-neutral-ice border-primary">
        <div className="text-center py-4">
          <p className="text-neutral-charcoal font-semibold mb-2">
            📊 Analytics Placeholder
          </p>
          <p className="text-sm text-neutral-medium">
            This is a placeholder with mock data and charts. Real-time analytics,
            custom reports, and advanced insights will be implemented in future milestones.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
