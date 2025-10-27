import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  CopyOutlined,
  TrophyOutlined,
  StopOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';
import dayjs from 'dayjs';

const ActiveChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState([]);

  useEffect(() => {
    fetchActiveChallenges();

    // Set up real-time subscription
    const subscription = supabase
      .channel('challenge_participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
        },
        () => {
          fetchActiveChallenges();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchActiveChallenges = async () => {
    setLoading(true);
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants (
            id,
            user_id
          )
        `)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false });

      if (error) throw error;

      const challengesWithDetails = data.map(challenge => ({
        ...challenge,
        participants_count: challenge.challenge_participants?.length || 0,
        days_remaining: dayjs(challenge.end_date).diff(dayjs(), 'day'),
        join_link: `${window.location.origin}/join-challenge/${challenge.id}`,
      }));

      setChallenges(challengesWithDetails);
    } catch (error) {
      message.error('Failed to fetch active challenges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndChallenge = async (challengeId, challengeTitle) => {
    Modal.confirm({
      title: 'End Challenge',
      content: `Are you sure you want to end "${challengeTitle}"? This will mark the challenge as completed.`,
      okText: 'End Challenge',
      okType: 'danger',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('challenges')
            .update({ end_date: new Date().toISOString() })
            .eq('id', challengeId);

          if (error) throw error;
          message.success('Challenge ended successfully!');
          fetchActiveChallenges();
        } catch (error) {
          message.error('Failed to end challenge: ' + error.message);
        }
      },
    });
  };

  const handleCopyJoinLink = (link) => {
    navigator.clipboard.writeText(link);
    message.success('Join link copied to clipboard!');
  };

  const handleViewLeaderboard = async (challengeId) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            level
          )
        `)
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false })
        .limit(10);

      if (error) throw error;

      const leaderboardData = data.map((participant, index) => ({
        ...participant,
        rank: index + 1,
      }));

      setSelectedLeaderboard(leaderboardData);
      setLeaderboardModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch leaderboard: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-semibold text-text-primary">{title}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          local: 'purple',
          verified: 'gold',
          community: 'cyan',
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Participants',
      dataIndex: 'participants_count',
      key: 'participants_count',
      render: (count) => (
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-primary" />
          <span className="font-semibold">{count}</span>
        </div>
      ),
      sorter: (a, b) => a.participants_count - b.participants_count,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || <span className="text-text-tertiary">N/A</span>,
    },
    {
      title: 'Days Remaining',
      dataIndex: 'days_remaining',
      key: 'days_remaining',
      render: (days) => {
        const color = days <= 3 ? 'error' : days <= 7 ? 'warning' : 'success';
        return (
          <Tag color={color}>
            {days} {days === 1 ? 'day' : 'days'}
          </Tag>
        );
      },
      sorter: (a, b) => a.days_remaining - b.days_remaining,
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={() => handleCopyJoinLink(record.join_link)}
          >
            Copy Link
          </Button>
          <Button
            icon={<TrophyOutlined />}
            size="small"
            type="primary"
            className="bg-accent-gold border-accent-gold"
            onClick={() => handleViewLeaderboard(record.id)}
          >
            Leaderboard
          </Button>
          <Button
            icon={<StopOutlined />}
            size="small"
            danger
            onClick={() => handleEndChallenge(record.id, record.title)}
          >
            End
          </Button>
        </Space>
      ),
    },
  ];

  const leaderboardColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => {
        const colors = {
          1: 'gold',
          2: 'silver',
          3: '#CD7F32',
        };
        return (
          <span
            className="font-bold text-lg"
            style={{ color: colors[rank] || 'inherit' }}
          >
            #{rank}
          </span>
        );
      },
    },
    {
      title: 'User',
      dataIndex: ['profiles', 'full_name'],
      key: 'user',
      render: (name) => <span className="font-semibold">{name}</span>,
    },
    {
      title: 'Level',
      dataIndex: ['profiles', 'level'],
      key: 'level',
      render: (level) => <Tag color="purple">Level {level}</Tag>,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-primary-lavender-light rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${progress || 0}%` }}
            />
          </div>
          <span className="font-semibold">{progress || 0}%</span>
        </div>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => <span className="font-bold">{score || 0}</span>,
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
    },
  ];

  const totalParticipants = challenges.reduce(
    (sum, challenge) => sum + challenge.participants_count,
    0
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Active Challenges</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchActiveChallenges}>
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Active Challenges"
              value={challenges.length}
              valueStyle={{ color: '#7B68A6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Participants"
              value={totalParticipants}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#e7b85c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Avg Participants"
              value={
                challenges.length > 0
                  ? Math.round(totalParticipants / challenges.length)
                  : 0
              }
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Ending Soon"
              value={challenges.filter((c) => c.days_remaining <= 7).length}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {challenges.length === 0 && !loading ? (
          <div className="text-center py-12">
            <TrophyOutlined className="text-6xl text-text-tertiary mb-4" />
            <p className="text-text-secondary text-lg">No active challenges at the moment</p>
            <p className="text-text-tertiary">Create a new challenge to get started!</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={challenges}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-accent-gold" />
            <span>Challenge Leaderboard</span>
          </div>
        }
        open={leaderboardModalVisible}
        onCancel={() => setLeaderboardModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={leaderboardColumns}
          dataSource={selectedLeaderboard}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default ActiveChallenges;
