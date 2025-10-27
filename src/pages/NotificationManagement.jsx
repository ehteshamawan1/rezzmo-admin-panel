import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Modal,
  InputNumber,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  SendOutlined,
  ReloadOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';
import dayjs from 'dayjs';

const { TextArea } = Input;

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [targetType, setTargetType] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      message.error('Failed to fetch notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    form.validateFields().then((values) => {
      setPreviewData(values);
      setPreviewModalVisible(true);
    });
  };

  const handleSend = async (values) => {
    setSending(true);
    try {
      let targetUsers = [];

      // Determine target users based on selection
      if (values.target === 'all') {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (error) throw error;
        targetUsers = users;
      } else if (values.target === 'specific') {
        // Handle specific user targeting
        const { data: user, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('email', values.specific_email)
          .single();

        if (error) throw error;
        targetUsers = [user];
      } else if (values.target === 'segment') {
        // Handle user segment targeting
        let query = supabase.from('profiles').select('id, full_name, email');

        if (values.level_min) {
          query = query.gte('level', values.level_min);
        }
        if (values.level_max) {
          query = query.lte('level', values.level_max);
        }
        if (values.streak_min) {
          query = query.gte('current_streak', values.streak_min);
        }
        if (values.streak_max) {
          query = query.lte('current_streak', values.streak_max);
        }
        if (values.last_active) {
          const date = values.last_active.toISOString();
          query = query.gte('last_active', date);
        }

        const { data: users, error } = await query;
        if (error) throw error;
        targetUsers = users;
      }

      if (targetUsers.length === 0) {
        message.warning('No users match the specified criteria');
        setSending(false);
        return;
      }

      // Create notification records for each target user
      const notificationRecords = targetUsers.map((user) => ({
        user_id: user.id,
        type: values.type,
        title: values.title,
        body: values.body,
        is_read: false,
        data: {
          target_type: values.target,
          recipients_count: targetUsers.length,
        },
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notificationRecords);

      if (error) throw error;

      message.success(
        `Notification sent successfully to ${targetUsers.length} user(s)!`
      );
      form.resetFields();
      fetchNotifications();
    } catch (error) {
      message.error('Failed to send notification: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (notification) => {
    Modal.confirm({
      title: 'Resend Notification',
      content: 'Are you sure you want to resend this notification?',
      okText: 'Resend',
      onOk: async () => {
        try {
          const { error } = await supabase.from('notifications').insert([
            {
              user_id: notification.user_id,
              type: notification.type,
              title: notification.title,
              body: notification.body,
              is_read: false,
              data: notification.data,
            },
          ]);

          if (error) throw error;
          message.success('Notification resent successfully!');
          fetchNotifications();
        } catch (error) {
          message.error('Failed to resend notification: ' + error.message);
        }
      },
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      streak_reminder: 'orange',
      mission_completed: 'green',
      challenge_invite: 'blue',
      achievement_unlocked: 'gold',
      workout_reminder: 'purple',
      social_update: 'cyan',
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM DD, YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {type.replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-semibold">{title}</span>,
    },
    {
      title: 'Recipients',
      dataIndex: ['data', 'recipients_count'],
      key: 'recipients',
      render: (count) => count || 1,
    },
    {
      title: 'Status',
      dataIndex: 'is_read',
      key: 'status',
      render: (isRead) =>
        isRead ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Read
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Unread
          </Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<SendOutlined />}
          size="small"
          onClick={() => handleResend(record)}
        >
          Resend
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Notification Management
        </h1>
        <Button icon={<ReloadOutlined />} onClick={fetchNotifications}>
          Refresh
        </Button>
      </div>

      {/* Send Notification Form */}
      <Card title="Send New Notification" className="mb-6">
        <Form form={form} layout="vertical" onFinish={handleSend}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="Notification Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select type">
                  <Select.Option value="streak_reminder">
                    Streak Reminder
                  </Select.Option>
                  <Select.Option value="mission_completed">
                    Mission Completed
                  </Select.Option>
                  <Select.Option value="challenge_invite">
                    Challenge Invite
                  </Select.Option>
                  <Select.Option value="achievement_unlocked">
                    Achievement Unlocked
                  </Select.Option>
                  <Select.Option value="workout_reminder">
                    Workout Reminder
                  </Select.Option>
                  <Select.Option value="social_update">
                    Social Update
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="target"
                label="Target Audience"
                rules={[{ required: true, message: 'Please select target' }]}
              >
                <Select
                  placeholder="Select target"
                  onChange={(value) => setTargetType(value)}
                >
                  <Select.Option value="all">All Users</Select.Option>
                  <Select.Option value="specific">Specific User</Select.Option>
                  <Select.Option value="segment">User Segment</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {targetType === 'specific' && (
            <Form.Item
              name="specific_email"
              label="User Email"
              rules={[{ required: true, message: 'Please enter user email' }]}
            >
              <Input placeholder="user@example.com" />
            </Form.Item>
          )}

          {targetType === 'segment' && (
            <Card className="mb-4 bg-primary-lavender-light">
              <p className="font-semibold mb-3 text-text-primary">
                User Segment Filters
              </p>
              <Row gutter={16}>
                <Col xs={12} md={6}>
                  <Form.Item name="level_min" label="Min Level">
                    <InputNumber
                      placeholder="0"
                      min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="level_max" label="Max Level">
                    <InputNumber
                      placeholder="100"
                      min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="streak_min" label="Min Streak">
                    <InputNumber
                      placeholder="0"
                      min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name="streak_max" label="Max Streak">
                    <InputNumber
                      placeholder="365"
                      min={0}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="last_active" label="Last Active After">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          <Form.Item
            name="title"
            label="Notification Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Keep your streak going!" />
          </Form.Item>

          <Form.Item
            name="body"
            label="Notification Body"
            rules={[{ required: true, message: 'Please enter body' }]}
          >
            <TextArea
              rows={4}
              placeholder="Write your notification message..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                htmlType="submit"
                loading={sending}
                className="bg-primary"
              >
                Send Notification
              </Button>
              <Button icon={<BellOutlined />} onClick={handlePreview}>
                Preview
              </Button>
              <Button onClick={() => form.resetFields()}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Notification History */}
      <Card title="Notification History">
        <Table
          columns={columns}
          dataSource={notifications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Notification Preview"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={400}
      >
        {previewData && (
          <Card className="bg-gradient-card border-primary">
            <Space direction="vertical" className="w-full">
              <div className="flex items-start gap-3">
                <BellOutlined className="text-2xl text-primary mt-1" />
                <div className="flex-1">
                  <Tag color={getTypeColor(previewData.type)} className="mb-2">
                    {previewData.type?.replace(/_/g, ' ').toUpperCase()}
                  </Tag>
                  <h3 className="font-bold text-lg text-text-primary mb-2">
                    {previewData.title}
                  </h3>
                  <p className="text-text-secondary">{previewData.body}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-gray-light">
                <p className="text-text-tertiary text-xs">
                  Target:{' '}
                  <span className="font-semibold">
                    {previewData.target === 'all'
                      ? 'All Users'
                      : previewData.target === 'specific'
                      ? `Specific User (${previewData.specific_email})`
                      : 'User Segment'}
                  </span>
                </p>
              </div>
            </Space>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default NotificationManagement;
