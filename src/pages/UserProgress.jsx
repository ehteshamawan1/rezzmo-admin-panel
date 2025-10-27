import { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Select,
  Space,
  Avatar,
  Button,
  Row,
  Col,
  Statistic,
  message,
  Tag,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
  FireOutlined,
  RiseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../services/supabase';

const UserProgress = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStreak, setFilterStreak] = useState('all');
  const [filterActivity, setFilterActivity] = useState('all');
  const [stats, setStats] = useState({
    totalActiveUsers: 0,
    avgLevel: 0,
    avgStreak: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          workout_sessions (
            id,
            created_at
          )
        `)
        .order('level', { ascending: false });

      if (error) throw error;

      const usersWithStats = data.map((user) => ({
        ...user,
        total_workouts: user.workout_sessions?.length || 0,
      }));

      setUsers(usersWithStats);

      // Calculate stats
      const activeUsers = usersWithStats.filter(
        (u) => u.total_workouts > 0
      ).length;

      const avgLevel =
        usersWithStats.length > 0
          ? (
              usersWithStats.reduce((sum, u) => sum + (u.level || 0), 0) /
              usersWithStats.length
            ).toFixed(1)
          : 0;

      const avgStreak =
        usersWithStats.length > 0
          ? Math.round(
              usersWithStats.reduce((sum, u) => sum + (u.current_streak || 0), 0) /
                usersWithStats.length
            )
          : 0;

      setStats({
        totalActiveUsers: activeUsers,
        avgLevel,
        avgStreak,
      });
    } catch (error) {
      message.error('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 50) return '#e7b85c';
    if (level >= 25) return '#7B68A6';
    return '#10b981';
  };

  const getStreakTag = (streak) => {
    if (streak >= 30) return { color: 'gold', text: 'On Fire!' };
    if (streak >= 14) return { color: 'orange', text: 'Hot Streak' };
    if (streak >= 7) return { color: 'green', text: 'Good' };
    return { color: 'default', text: 'Active' };
  };

  const filteredUsers = users.filter((user) => {
    const searchMatch =
      !searchText ||
      user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase());

    const levelMatch =
      filterLevel === 'all' ||
      (filterLevel === '0-10' && user.level <= 10) ||
      (filterLevel === '11-25' && user.level > 10 && user.level <= 25) ||
      (filterLevel === '26-50' && user.level > 25 && user.level <= 50) ||
      (filterLevel === '50+' && user.level > 50);

    const streakMatch =
      filterStreak === 'all' ||
      (filterStreak === '0-7' && user.current_streak <= 7) ||
      (filterStreak === '8-14' && user.current_streak > 7 && user.current_streak <= 14) ||
      (filterStreak === '15-30' && user.current_streak > 14 && user.current_streak <= 30) ||
      (filterStreak === '30+' && user.current_streak > 30);

    const activityMatch =
      filterActivity === 'all' ||
      (filterActivity === 'very_active' && user.total_workouts >= 50) ||
      (filterActivity === 'active' && user.total_workouts >= 20 && user.total_workouts < 50) ||
      (filterActivity === 'moderate' && user.total_workouts >= 5 && user.total_workouts < 20) ||
      (filterActivity === 'low' && user.total_workouts < 5);

    return searchMatch && levelMatch && streakMatch && activityMatch;
  });

  // Mock XP over time data - would come from user activity logs
  const mockXPData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    xp: Math.floor(Math.random() * 200) + 100,
  }));

  // Mock workout frequency data
  const mockWorkoutData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    workouts: Math.floor(Math.random() * 3) + 1,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-text-primary">
        User Progress Monitoring
      </h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Active Users"
              value={stats.totalActiveUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#7B68A6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Average Level"
              value={stats.avgLevel}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#e7b85c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Average Streak"
              value={stats.avgStreak}
              suffix="days"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full" direction="vertical" size="middle">
          <Input
            placeholder="Search users by name or email..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />
          <Space wrap>
            <Select
              value={filterLevel}
              onChange={setFilterLevel}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Levels</Select.Option>
              <Select.Option value="0-10">Level 0-10</Select.Option>
              <Select.Option value="11-25">Level 11-25</Select.Option>
              <Select.Option value="26-50">Level 26-50</Select.Option>
              <Select.Option value="50+">Level 50+</Select.Option>
            </Select>
            <Select
              value={filterStreak}
              onChange={setFilterStreak}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Streaks</Select.Option>
              <Select.Option value="0-7">0-7 days</Select.Option>
              <Select.Option value="8-14">8-14 days</Select.Option>
              <Select.Option value="15-30">15-30 days</Select.Option>
              <Select.Option value="30+">30+ days</Select.Option>
            </Select>
            <Select
              value={filterActivity}
              onChange={setFilterActivity}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Activity</Select.Option>
              <Select.Option value="very_active">Very Active (50+)</Select.Option>
              <Select.Option value="active">Active (20-49)</Select.Option>
              <Select.Option value="moderate">Moderate (5-19)</Select.Option>
              <Select.Option value="low">Low (&lt;5)</Select.Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* User Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {filteredUsers.slice(0, 12).map((user) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
            <Card className="bg-gradient-card hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar
                  size={64}
                  src={user.avatar_url}
                  icon={<UserOutlined />}
                  className="mb-3"
                />
                <h3 className="font-bold text-lg text-text-primary mb-1">
                  {user.full_name || 'Unknown User'}
                </h3>
                <p className="text-text-tertiary text-sm mb-3">{user.email}</p>

                <Space direction="vertical" size="small" className="w-full">
                  <div className="flex justify-between w-full">
                    <span className="text-text-secondary">Level</span>
                    <Tag color={getLevelColor(user.level || 0)}>
                      {user.level || 0}
                    </Tag>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="text-text-secondary">XP</span>
                    <span className="font-semibold">{user.total_xp || 0}</span>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="text-text-secondary">Streak</span>
                    <Tag color={getStreakTag(user.current_streak || 0).color}>
                      <FireOutlined /> {user.current_streak || 0} days
                    </Tag>
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="text-text-secondary">Workouts</span>
                    <span className="font-semibold">{user.total_workouts}</span>
                  </div>
                </Space>

                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  className="mt-3 bg-primary"
                  block
                >
                  View Full Profile
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredUsers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <UserOutlined className="text-6xl text-text-tertiary mb-4" />
            <p className="text-text-secondary text-lg">No users found</p>
            <p className="text-text-tertiary">Try adjusting your filters</p>
          </div>
        </Card>
      )}

      {/* Progress Charts */}
      {filteredUsers.length > 0 && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} lg={12}>
            <Card title="XP Progress (Last 7 Days)" className="h-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockXPData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#e7b85c"
                    strokeWidth={2}
                    dot={{ fill: '#e7b85c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Workout Frequency (Last 7 Days)" className="h-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="workouts" fill="#7B68A6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default UserProgress;
