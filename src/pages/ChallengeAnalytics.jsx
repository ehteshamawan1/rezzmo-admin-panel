import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message } from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  RiseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { supabase } from '../services/supabase';
import dayjs from 'dayjs';

const ChallengeAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalParticipants: 0,
    completionRate: 0,
  });
  const [participantsByChallenge, setParticipantsByChallenge] = useState([]);
  const [participationOverTime, setParticipationOverTime] = useState([]);
  const [challengesByType, setChallengesByType] = useState([]);
  const [topChallenges, setTopChallenges] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all challenges with participants
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants (
            id,
            user_id,
            progress,
            created_at
          )
        `);

      if (challengesError) throw challengesError;

      // Calculate stats
      const now = new Date().toISOString();
      const activeChallenges = challenges.filter(
        (c) => c.start_date <= now && c.end_date >= now
      );

      const totalParticipants = challenges.reduce(
        (sum, c) => sum + (c.challenge_participants?.length || 0),
        0
      );

      const completedChallenges = challenges.reduce(
        (sum, c) =>
          sum +
          (c.challenge_participants?.filter((p) => p.progress >= 100).length || 0),
        0
      );

      const completionRate =
        totalParticipants > 0
          ? ((completedChallenges / totalParticipants) * 100).toFixed(1)
          : 0;

      setStats({
        totalChallenges: challenges.length,
        activeChallenges: activeChallenges.length,
        totalParticipants,
        completionRate,
      });

      // Participants by challenge (top 10)
      const participantsData = challenges
        .map((c) => ({
          name: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title,
          participants: c.challenge_participants?.length || 0,
        }))
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 10);

      setParticipantsByChallenge(participantsData);

      // Participation over time (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = dayjs().subtract(29 - i, 'day');
        return {
          date: date.format('MMM DD'),
          participants: 0,
        };
      });

      challenges.forEach((challenge) => {
        challenge.challenge_participants?.forEach((participant) => {
          const participantDate = dayjs(participant.created_at);
          const dayIndex = last30Days.findIndex((day) =>
            dayjs(day.date, 'MMM DD').isSame(participantDate, 'day')
          );
          if (dayIndex !== -1) {
            last30Days[dayIndex].participants += 1;
          }
        });
      });

      setParticipationOverTime(last30Days);

      // Challenges by type
      const typeCount = challenges.reduce((acc, challenge) => {
        acc[challenge.type] = (acc[challenge.type] || 0) + 1;
        return acc;
      }, {});

      const typeData = Object.entries(typeCount).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
      }));

      setChallengesByType(typeData);

      // Top 5 most popular challenges
      const top5 = challenges
        .map((c) => ({
          id: c.id,
          title: c.title,
          type: c.type,
          participants: c.challenge_participants?.length || 0,
          completion_rate:
            c.challenge_participants?.length > 0
              ? (
                  (c.challenge_participants.filter((p) => p.progress >= 100)
                    .length /
                    c.challenge_participants.length) *
                  100
                ).toFixed(1)
              : 0,
          status: c.start_date <= now && c.end_date >= now ? 'Active' : 'Completed',
        }))
        .sort((a, b) => b.participants - a.participants)
        .slice(0, 5);

      setTopChallenges(top5);
    } catch (error) {
      message.error('Failed to fetch analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#7B68A6', '#e7b85c', '#d9bbc5', '#10b981', '#f59e0b'];

  const topChallengesColumns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 70,
      render: (_, __, index) => (
        <span className="font-bold text-lg text-accent-gold">#{index + 1}</span>
      ),
    },
    {
      title: 'Challenge',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-semibold">{title}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="capitalize text-text-secondary">{type}</span>
      ),
    },
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
      render: (count) => (
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-primary" />
          <span className="font-semibold">{count}</span>
        </div>
      ),
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completion_rate',
      key: 'completion_rate',
      render: (rate) => (
        <span className="font-semibold text-status-success">{rate}%</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            status === 'Active'
              ? 'bg-status-success text-white'
              : 'bg-neutral-gray-light text-text-primary'
          }`}
        >
          {status}
        </span>
      ),
    },
  ];

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
        Challenge Analytics
      </h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Challenges"
              value={stats.totalChallenges}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#7B68A6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Active Challenges"
              value={stats.activeChallenges}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Participants"
              value={stats.totalParticipants}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#e7b85c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Participants by Challenge (Top 10)" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={participantsByChallenge}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" fill="#7B68A6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Challenge Participation Over Time (Last 30 Days)" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={participationOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="participants"
                  stroke="#e7b85c"
                  strokeWidth={2}
                  dot={{ fill: '#e7b85c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="Challenges by Type" className="h-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={challengesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {challengesByType.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Top 5 Most Popular Challenges" className="h-full">
            <Table
              columns={topChallengesColumns}
              dataSource={topChallenges}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ChallengeAnalytics;
