import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Space,
  Tag,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [selectedChallengeParticipants, setSelectedChallengeParticipants] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participants (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const challengesWithCount = data.map(challenge => ({
        ...challenge,
        participants_count: challenge.challenge_participants?.length || 0,
        status: getChallengeStatus(challenge.start_date, challenge.end_date),
      }));

      setChallenges(challengesWithCount);
    } catch (error) {
      message.error('Failed to fetch challenges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeStatus = (startDate, endDate) => {
    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (now.isBefore(start)) return 'upcoming';
    if (now.isAfter(end)) return 'completed';
    return 'active';
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      const challengeData = {
        title: values.title,
        description: values.description,
        type: values.type,
        location: values.location || null,
        start_date: values.dateRange[0].toISOString(),
        end_date: values.dateRange[1].toISOString(),
        target_value: values.target_value || null,
        xp_reward: values.xp_reward || 100,
      };

      if (editingChallenge) {
        const { error } = await supabase
          .from('challenges')
          .update(challengeData)
          .eq('id', editingChallenge.id);

        if (error) throw error;
        message.success('Challenge updated successfully!');
      } else {
        const { error } = await supabase
          .from('challenges')
          .insert([challengeData]);

        if (error) throw error;
        message.success('Challenge created successfully!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingChallenge(null);
      fetchChallenges();
    } catch (error) {
      message.error('Failed to save challenge: ' + error.message);
    }
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    form.setFieldsValue({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      location: challenge.location,
      dateRange: [dayjs(challenge.start_date), dayjs(challenge.end_date)],
      target_value: challenge.target_value,
      xp_reward: challenge.xp_reward,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this challenge?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('challenges')
            .delete()
            .eq('id', id);

          if (error) throw error;
          message.success('Challenge deleted successfully!');
          fetchChallenges();
        } catch (error) {
          message.error('Failed to delete challenge: ' + error.message);
        }
      },
    });
  };

  const handleViewParticipants = async (challengeId) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId);

      if (error) throw error;
      setSelectedChallengeParticipants(data);
      setParticipantsModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch participants: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'processing';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'local':
        return 'purple';
      case 'verified':
        return 'gold';
      case 'community':
        return 'cyan';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => `#${id.toString().slice(0, 8)}`,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Participants',
      dataIndex: 'participants_count',
      key: 'participants_count',
      render: (count) => (
        <span>
          <TeamOutlined /> {count}
        </span>
      ),
      sorter: (a, b) => a.participants_count - b.participants_count,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
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
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<TeamOutlined />}
            size="small"
            onClick={() => handleViewParticipants(record.id)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const filteredChallenges = challenges.filter((challenge) => {
    const statusMatch = filterStatus === 'all' || challenge.status === filterStatus;
    const typeMatch = filterType === 'all' || challenge.type === filterType;
    return statusMatch && typeMatch;
  });

  const participantColumns = [
    {
      title: 'User',
      dataIndex: ['profiles', 'full_name'],
      key: 'user',
    },
    {
      title: 'Email',
      dataIndex: ['profiles', 'email'],
      key: 'email',
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => `${progress || 0}%`,
    },
    {
      title: 'Joined Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Challenge Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingChallenge(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          className="bg-primary"
        >
          Create Challenge
        </Button>
      </div>

      <Card className="mb-4">
        <Space className="w-full" direction="vertical" size="middle">
          <Input.Search
            placeholder="Search challenges..."
            allowClear
            onSearch={setSearchText}
            style={{ width: 300 }}
          />
          <Space>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="upcoming">Upcoming</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
            </Select>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="local">Local</Select.Option>
              <Select.Option value="verified">Verified</Select.Option>
              <Select.Option value="community">Community</Select.Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchChallenges}>
              Refresh
            </Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredChallenges}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingChallenge(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            name="title"
            label="Challenge Title"
            rules={[{ required: true, message: 'Please enter challenge title' }]}
          >
            <Input placeholder="e.g., 30-Day Fitness Challenge" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={4} placeholder="Describe the challenge..." />
          </Form.Item>

          <Form.Item
            name="type"
            label="Challenge Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="local">Local</Select.Option>
              <Select.Option value="verified">Verified</Select.Option>
              <Select.Option value="community">Community</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="location" label="Location (Optional)">
            <Input placeholder="e.g., New York, USA" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Challenge Duration"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="target_value" label="Target Value (Optional)">
            <Input type="number" placeholder="e.g., 10000 steps" />
          </Form.Item>

          <Form.Item name="xp_reward" label="XP Reward" initialValue={100}>
            <Input type="number" placeholder="XP reward for completion" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-primary">
                {editingChallenge ? 'Update' : 'Create'} Challenge
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingChallenge(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Challenge Participants"
        open={participantsModalVisible}
        onCancel={() => setParticipantsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={participantColumns}
          dataSource={selectedChallengeParticipants}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );
};

export default Challenges;
