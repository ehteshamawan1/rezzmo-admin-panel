import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  message,
  Space,
  Tag,
  Switch,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';

const { TextArea } = Input;

const MissionManagement = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewMission, setPreviewMission] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data);
    } catch (error) {
      message.error('Failed to fetch missions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      const missionData = {
        type: values.type,
        category: values.category,
        title: values.title,
        description: values.description,
        target_value: values.target_value,
        xp_reward: values.xp_reward,
        is_active: values.is_active !== undefined ? values.is_active : true,
      };

      if (editingMission) {
        const { error } = await supabase
          .from('missions')
          .update(missionData)
          .eq('id', editingMission.id);

        if (error) throw error;
        message.success('Mission updated successfully!');
      } else {
        const { error } = await supabase
          .from('missions')
          .insert([missionData]);

        if (error) throw error;
        message.success('Mission created successfully!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingMission(null);
      fetchMissions();
    } catch (error) {
      message.error('Failed to save mission: ' + error.message);
    }
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    form.setFieldsValue(mission);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this mission?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('missions')
            .delete()
            .eq('id', id);

          if (error) throw error;
          message.success('Mission deleted successfully!');
          fetchMissions();
        } catch (error) {
          message.error('Failed to delete mission: ' + error.message);
        }
      },
    });
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      message.success(`Mission ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchMissions();
    } catch (error) {
      message.error('Failed to update mission status: ' + error.message);
    }
  };

  const handlePreview = (mission) => {
    setPreviewMission(mission);
    setPreviewModalVisible(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'daily':
        return 'blue';
      case 'weekly':
        return 'green';
      case 'monthly':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      workout: 'orange',
      social: 'cyan',
      challenge: 'magenta',
      achievement: 'gold',
    };
    return colors[category?.toLowerCase()] || 'default';
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{type?.toUpperCase()}</Tag>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-semibold">{title}</span>,
    },
    {
      title: 'Target',
      dataIndex: 'target_value',
      key: 'target_value',
      render: (target) => <span>{target}</span>,
    },
    {
      title: 'XP Reward',
      dataIndex: 'xp_reward',
      key: 'xp_reward',
      render: (xp) => <Tag color="gold">+{xp} XP</Tag>,
      sorter: (a, b) => (a.xp_reward || 0) - (b.xp_reward || 0),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id, isActive)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
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

  const filteredMissions = missions.filter((mission) => {
    const typeMatch = filterType === 'all' || mission.type === filterType;
    const categoryMatch =
      filterCategory === 'all' || mission.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  const categories = [...new Set(missions.map((m) => m.category).filter(Boolean))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Mission Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingMission(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          className="bg-primary"
        >
          Create Mission
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All Types</Select.Option>
            <Select.Option value="daily">Daily</Select.Option>
            <Select.Option value="weekly">Weekly</Select.Option>
            <Select.Option value="monthly">Monthly</Select.Option>
          </Select>
          <Select
            value={filterCategory}
            onChange={setFilterCategory}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All Categories</Select.Option>
            {categories.map((cat) => (
              <Select.Option key={cat} value={cat}>
                {cat}
              </Select.Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchMissions}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Missions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredMissions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create/Edit Mission Modal */}
      <Modal
        title={editingMission ? 'Edit Mission' : 'Create New Mission'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingMission(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
          initialValues={{ is_active: true }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Mission Type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select placeholder="Select type">
                  <Select.Option value="daily">Daily</Select.Option>
                  <Select.Option value="weekly">Weekly</Select.Option>
                  <Select.Option value="monthly">Monthly</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Select.Option value="workout">Workout</Select.Option>
                  <Select.Option value="social">Social</Select.Option>
                  <Select.Option value="challenge">Challenge</Select.Option>
                  <Select.Option value="achievement">Achievement</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Mission Title"
            rules={[{ required: true, message: 'Please enter mission title' }]}
          >
            <Input placeholder="e.g., Complete 5 Workouts" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Describe the mission..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="target_value"
                label="Target Value"
                rules={[{ required: true, message: 'Please enter target value' }]}
              >
                <Input type="number" placeholder="e.g., 5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="xp_reward"
                label="XP Reward"
                rules={[{ required: true, message: 'Please enter XP reward' }]}
              >
                <Input type="number" placeholder="e.g., 100" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_active" label="Active Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-primary">
                {editingMission ? 'Update' : 'Create'} Mission
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingMission(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Mission Modal */}
      <Modal
        title="Mission Preview"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={500}
      >
        {previewMission && (
          <Card className="bg-gradient-card border-primary">
            <div className="text-center">
              <Space direction="vertical" size="small" className="w-full">
                <div>
                  <Tag color={getTypeColor(previewMission.type)}>
                    {previewMission.type?.toUpperCase()}
                  </Tag>
                  <Tag color={getCategoryColor(previewMission.category)}>
                    {previewMission.category?.toUpperCase()}
                  </Tag>
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  {previewMission.title}
                </h2>
                <p className="text-text-secondary">{previewMission.description}</p>
                <div className="mt-4 p-4 bg-primary-lavender-light rounded-lg">
                  <p className="text-text-secondary text-sm mb-2">Progress</p>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      0 / {previewMission.target_value}
                    </span>
                    <Tag color="gold">+{previewMission.xp_reward} XP</Tag>
                  </div>
                  <div className="mt-2 w-full bg-white rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default MissionManagement;
