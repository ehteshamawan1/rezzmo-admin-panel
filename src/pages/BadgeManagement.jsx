import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  Modal,
  message,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TrophyOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';

const { TextArea } = Input;

const BadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [filterRarity, setFilterRarity] = useState('all');
  const [stats, setStats] = useState({
    totalBadges: 0,
    mostEarnedBadge: '',
  });
  const [form] = Form.useForm();

  const badgeIcons = [
    { value: 'trophy', label: 'Trophy', icon: <TrophyOutlined /> },
    { value: 'crown', label: 'Crown', icon: <CrownOutlined /> },
    { value: 'star', label: 'Star', icon: <StarOutlined /> },
  ];

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select(`
          *,
          user_badges (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const badgesWithCount = data.map((badge) => ({
        ...badge,
        users_earned: badge.user_badges?.length || 0,
      }));

      setBadges(badgesWithCount);

      // Calculate stats
      const mostEarned = badgesWithCount.reduce(
        (max, badge) => (badge.users_earned > max.users_earned ? badge : max),
        badgesWithCount[0] || { name: 'N/A', users_earned: 0 }
      );

      setStats({
        totalBadges: badgesWithCount.length,
        mostEarnedBadge: mostEarned.name,
      });
    } catch (error) {
      message.error('Failed to fetch badges: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      const badgeData = {
        name: values.name,
        description: values.description,
        icon: values.icon,
        rarity: values.rarity,
        category: values.category,
        criteria_json: values.criteria_json
          ? JSON.parse(values.criteria_json)
          : null,
      };

      if (editingBadge) {
        const { error } = await supabase
          .from('achievements')
          .update(badgeData)
          .eq('id', editingBadge.id);

        if (error) throw error;
        message.success('Badge updated successfully!');
      } else {
        const { error } = await supabase
          .from('achievements')
          .insert([badgeData]);

        if (error) throw error;
        message.success('Badge created successfully!');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingBadge(null);
      fetchBadges();
    } catch (error) {
      message.error('Failed to save badge: ' + error.message);
    }
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    form.setFieldsValue({
      ...badge,
      criteria_json: badge.criteria_json
        ? JSON.stringify(badge.criteria_json, null, 2)
        : '',
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this badge?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('achievements')
            .delete()
            .eq('id', id);

          if (error) throw error;
          message.success('Badge deleted successfully!');
          fetchBadges();
        } catch (error) {
          message.error('Failed to delete badge: ' + error.message);
        }
      },
    });
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#808080';
      case 'rare':
        return '#0891b2';
      case 'epic':
        return '#7B68A6';
      case 'legendary':
        return '#e7b85c';
      default:
        return '#808080';
    }
  };

  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
      case 'rare':
        return 'linear-gradient(135deg, #67e8f9 0%, #0891b2 100%)';
      case 'epic':
        return 'linear-gradient(135deg, #c4b5fd 0%, #7B68A6 100%)';
      case 'legendary':
        return 'linear-gradient(135deg, #fcd34d 0%, #e7b85c 100%)';
      default:
        return 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
    }
  };

  const getIconComponent = (iconName) => {
    const icon = badgeIcons.find((i) => i.value === iconName);
    return icon ? icon.icon : <TrophyOutlined />;
  };

  const filteredBadges = badges.filter((badge) => {
    return filterRarity === 'all' || badge.rarity === filterRarity;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Badge & Achievement Management
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingBadge(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
          className="bg-primary"
        >
          Create Badge
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Badges"
              value={stats.totalBadges}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#7B68A6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Most Earned Badge"
              value={stats.mostEarnedBadge}
              valueStyle={{ color: '#e7b85c', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space>
          <Select
            value={filterRarity}
            onChange={setFilterRarity}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All Rarities</Select.Option>
            <Select.Option value="common">Common</Select.Option>
            <Select.Option value="rare">Rare</Select.Option>
            <Select.Option value="epic">Epic</Select.Option>
            <Select.Option value="legendary">Legendary</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchBadges}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Badge Grid */}
      <Row gutter={[16, 16]}>
        {filteredBadges.map((badge) => (
          <Col xs={24} sm={12} md={8} lg={6} key={badge.id}>
            <Card
              className="hover:shadow-lg transition-shadow"
              style={{
                background: getRarityGradient(badge.rarity),
                border: `2px solid ${getRarityColor(badge.rarity)}`,
              }}
            >
              <div className="text-center">
                <div
                  className="text-6xl mb-3"
                  style={{ color: getRarityColor(badge.rarity) }}
                >
                  {getIconComponent(badge.icon)}
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-2">
                  {badge.name}
                </h3>
                <Tag
                  color={getRarityColor(badge.rarity)}
                  className="mb-2 font-semibold"
                >
                  {badge.rarity?.toUpperCase()}
                </Tag>
                <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                  {badge.description}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-text-tertiary text-xs">Users Earned</span>
                  <Tag color="blue">{badge.users_earned}</Tag>
                </div>
                <Space size="small">
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEdit(badge)}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => handleDelete(badge.id)}
                  />
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredBadges.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <TrophyOutlined className="text-6xl text-text-tertiary mb-4" />
            <p className="text-text-secondary text-lg">No badges found</p>
            <p className="text-text-tertiary">Create your first badge to get started!</p>
          </div>
        </Card>
      )}

      {/* Create/Edit Badge Modal */}
      <Modal
        title={editingBadge ? 'Edit Badge' : 'Create New Badge'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingBadge(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
          <Form.Item
            name="name"
            label="Badge Name"
            rules={[{ required: true, message: 'Please enter badge name' }]}
          >
            <Input placeholder="e.g., First Workout" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Describe the badge..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="Icon"
                rules={[{ required: true, message: 'Please select icon' }]}
              >
                <Select placeholder="Select icon">
                  {badgeIcons.map((icon) => (
                    <Select.Option key={icon.value} value={icon.value}>
                      <Space>
                        {icon.icon}
                        {icon.label}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rarity"
                label="Rarity"
                rules={[{ required: true, message: 'Please select rarity' }]}
              >
                <Select placeholder="Select rarity">
                  <Select.Option value="common">Common</Select.Option>
                  <Select.Option value="rare">Rare</Select.Option>
                  <Select.Option value="epic">Epic</Select.Option>
                  <Select.Option value="legendary">Legendary</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input placeholder="e.g., workout, social, challenge" />
          </Form.Item>

          <Form.Item
            name="criteria_json"
            label="Criteria (JSON)"
            help="Optional JSON object defining unlock criteria"
          >
            <TextArea
              rows={4}
              placeholder='e.g., {"workouts_completed": 10}'
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-primary">
                {editingBadge ? 'Update' : 'Create'} Badge
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingBadge(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BadgeManagement;
