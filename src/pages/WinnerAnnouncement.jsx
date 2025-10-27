import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Statistic,
  Row,
  Col,
  Avatar,
  Space,
  Typography,
  Divider,
} from 'antd';
import {
  TrophyOutlined,
  CrownOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/// Winner Announcement System - Admin Panel
/// Milestone 3: Verified Trainer Challenges Setup
/// Allows admins to select winners and announce results to participants

const WinnerAnnouncement = () => {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [announcementForm] = Form.useForm();

  useEffect(() => {
    loadCompletedChallenges();
  }, []);

  const loadCompletedChallenges = async () => {
    try {
      setLoading(true);

      // Load completed challenges without winners announced
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants (count)
        `)
        .eq('status', 'completed')
        .is('winner_announced_at', null)
        .order('end_date', { ascending: false });

      if (error) throw error;

      setChallenges(data || []);
    } catch (error) {
      message.error('Failed to load challenges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (challengeId) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          profiles:user_id (
            id,
            display_name,
            avatar_url,
            level
          )
        `)
        .eq('challenge_id', challengeId)
        .order('points', { ascending: false })
        .limit(10);

      if (error) throw error;

      setParticipants(data || []);
    } catch (error) {
      message.error('Failed to load leaderboard: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChallenge = async (challenge) => {
    setSelectedChallenge(challenge);
    await loadLeaderboard(challenge.id);
  };

  const handleAnnounceWinners = () => {
    if (!selectedChallenge) {
      message.warning('Please select a challenge first');
      return;
    }

    if (participants.length === 0) {
      message.warning('No participants found');
      return;
    }

    // Pre-fill form with top 3 participants
    const winners = participants.slice(0, 3).map((p, index) => ({
      rank: index + 1,
      userId: p.user_id,
      userName: p.profiles?.display_name || 'User',
      points: p.points,
    }));

    announcementForm.setFieldsValue({
      challengeId: selectedChallenge.id,
      challengeTitle: selectedChallenge.title,
      winners: JSON.stringify(winners, null, 2),
      announcementTitle: `${selectedChallenge.title} - Winners Announced!`,
      announcementMessage: `Congratulations to our winners! 🏆\n\n` +
        `🥇 1st Place: ${winners[0]?.userName} (${winners[0]?.points} points)\n` +
        `🥈 2nd Place: ${winners[1]?.userName} (${winners[1]?.points} points)\n` +
        `🥉 3rd Place: ${winners[2]?.userName} (${winners[2]?.points} points)\n\n` +
        `Thank you to all participants for your amazing effort!`,
    });

    setModalVisible(true);
  };

  const handleSubmitAnnouncement = async (values) => {
    try {
      setLoading(true);

      // Parse winners JSON
      const winners = JSON.parse(values.winners);

      // Update challenge with winner info
      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          winner_announced_at: new Date().toISOString(),
          winner_data: winners,
        })
        .eq('id', values.challengeId);

      if (updateError) throw updateError;

      // Create notifications for all participants
      const participantIds = participants.map((p) => p.user_id);

      const notifications = participantIds.map((userId) => ({
        user_id: userId,
        type: 'challenge_winner',
        title: values.announcementTitle,
        message: values.announcementMessage,
        data: {
          challenge_id: values.challengeId,
          winners: winners,
        },
        created_at: new Date().toISOString(),
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) throw notifError;

      // Send push notifications (via Edge Function)
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            user_ids: participantIds,
            type: 'challenge_winner',
            title: values.announcementTitle,
            body: values.announcementMessage.substring(0, 100) + '...',
            data: {
              challenge_id: values.challengeId,
              screen: 'challenge_detail',
            },
          },
        });
      } catch (pushError) {
        console.error('Push notification error:', pushError);
        // Don't fail the announcement if push fails
      }

      message.success('Winners announced successfully! 🎉');
      setModalVisible(false);
      announcementForm.resetFields();
      setSelectedChallenge(null);
      setParticipants([]);
      await loadCompletedChallenges();
    } catch (error) {
      message.error('Failed to announce winners: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Challenge',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(record.end_date).toLocaleDateString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          local: 'blue',
          verified: 'purple',
          community: 'green',
        };
        return <Tag color={colors[type] || 'default'}>{type?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Participants',
      dataIndex: 'challenge_participants',
      key: 'participants',
      render: (participants) => (
        <Statistic
          value={participants?.[0]?.count || 0}
          prefix={<UserOutlined />}
          valueStyle={{ fontSize: 16 }}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="gold">AWAITING ANNOUNCEMENT</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<TrophyOutlined />}
          onClick={() => handleSelectChallenge(record)}
        >
          Select
        </Button>
      ),
    },
  ];

  const leaderboardColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_, __, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        return (
          <Space>
            <Text style={{ fontSize: 20 }}>{medals[index] || `#${index + 1}`}</Text>
          </Space>
        );
      },
      width: 80,
    },
    {
      title: 'Participant',
      key: 'participant',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.profiles?.avatar_url}
            icon={<UserOutlined />}
            style={{
              backgroundColor: index => index < 3 ? '#FFD700' : '#1890ff',
            }}
          />
          <Space direction="vertical" size="small">
            <Text strong>{record.profiles?.display_name || 'User'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Level {record.profiles?.level || 1}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <Statistic
          value={points || 0}
          valueStyle={{ fontSize: 18, fontWeight: 'bold' }}
        />
      ),
      sorter: (a, b) => (a.points || 0) - (b.points || 0),
    },
    {
      title: 'Completed',
      dataIndex: 'completed_at',
      key: 'completed_at',
      render: (date) =>
        date ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            COMPLETED
          </Tag>
        ) : (
          <Tag color="default">IN PROGRESS</Tag>
        ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Title level={2}>
          <TrophyOutlined className="mr-2" />
          Winner Announcement System
        </Title>
        <Text type="secondary">
          Announce challenge winners and notify all participants
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <Statistic
              title="Challenges Awaiting"
              value={challenges.length}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Selected Challenge"
              value={selectedChallenge?.title || 'None'}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Participants"
              value={participants.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Completed Challenges Table */}
      <Card title="Completed Challenges" className="mb-6">
        <Table
          columns={columns}
          dataSource={challenges}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: 'No completed challenges awaiting announcement',
          }}
        />
      </Card>

      {/* Leaderboard */}
      {selectedChallenge && (
        <Card
          title={
            <Space>
              <CrownOutlined style={{ color: '#FFD700', fontSize: 20 }}/>
              Leaderboard: {selectedChallenge.title}
            </Space>
          }
          extra={
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleAnnounceWinners}
              disabled={participants.length === 0}
            >
              Announce Winners
            </Button>
          }
        >
          <Table
            columns={leaderboardColumns}
            dataSource={participants}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </Card>
      )}

      {/* Announcement Modal */}
      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ fontSize: 24, color: '#FFD700' }} />
            <span>Announce Winners</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={700}
        footer={null}
      >
        <Form
          form={announcementForm}
          layout="vertical"
          onFinish={handleSubmitAnnouncement}
        >
          <Form.Item name="challengeId" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="challengeTitle" label="Challenge">
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="winners"
            label="Winners (Top 3)"
            rules={[{ required: true, message: 'Winners data required' }]}
          >
            <TextArea rows={6} placeholder="Winner data in JSON format" />
          </Form.Item>

          <Divider />

          <Form.Item
            name="announcementTitle"
            label="Announcement Title"
            rules={[{ required: true, message: 'Title required' }]}
          >
            <Input placeholder="e.g., Challenge Winners Announced!" />
          </Form.Item>

          <Form.Item
            name="announcementMessage"
            label="Announcement Message"
            rules={[{ required: true, message: 'Message required' }]}
          >
            <TextArea
              rows={8}
              placeholder="Congratulations message for all participants..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                size="large"
              >
                Send Announcement
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WinnerAnnouncement;
