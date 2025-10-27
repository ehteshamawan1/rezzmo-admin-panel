import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Statistic,
  Row,
  Col,
  message,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { supabase } from '../services/supabase';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    mostPopularCategory: '',
    avgDuration: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_sessions (
            id,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const workoutsWithStats = data.map((workout) => {
        const sessions = workout.workout_sessions || [];
        const completedSessions = sessions.filter((s) => s.status === 'completed').length;
        const totalSessions = sessions.length;
        const completionRate =
          totalSessions > 0
            ? ((completedSessions / totalSessions) * 100).toFixed(1)
            : 0;

        return {
          ...workout,
          sessions_count: totalSessions,
          completion_rate: completionRate,
        };
      });

      setWorkouts(workoutsWithStats);

      // Calculate stats
      const totalSessions = workoutsWithStats.reduce(
        (sum, w) => sum + w.sessions_count,
        0
      );

      const categoryCount = {};
      let totalDuration = 0;
      workoutsWithStats.forEach((w) => {
        categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
        totalDuration += w.duration_minutes || 0;
      });

      const mostPopular = Object.entries(categoryCount).sort(
        (a, b) => b[1] - a[1]
      )[0];

      setStats({
        totalWorkouts: workoutsWithStats.length,
        mostPopularCategory: mostPopular ? mostPopular[0] : 'N/A',
        avgDuration: workoutsWithStats.length > 0
          ? Math.round(totalDuration / workoutsWithStats.length)
          : 0,
        totalSessions,
      });
    } catch (error) {
      message.error('Failed to fetch workouts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (workout) => {
    setSelectedWorkout(workout);
    setDetailsModalVisible(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      strength: 'purple',
      cardio: 'red',
      flexibility: 'blue',
      balance: 'green',
      hiit: 'orange',
      yoga: 'cyan',
    };
    return colors[category?.toLowerCase()] || 'default';
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
      render: (title) => <span className="font-semibold">{title}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category ? category.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty) => (
        <Tag color={getDifficultyColor(difficulty)}>
          {difficulty ? difficulty.toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (duration) => (
        <span>
          <ClockCircleOutlined /> {duration || 0} min
        </span>
      ),
      sorter: (a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0),
    },
    {
      title: 'Sessions',
      dataIndex: 'sessions_count',
      key: 'sessions_count',
      render: (count) => <span className="font-semibold">{count}</span>,
      sorter: (a, b) => a.sessions_count - b.sessions_count,
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completion_rate',
      key: 'completion_rate',
      render: (rate) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-primary-lavender-light rounded-full h-2 w-20">
            <div
              className="bg-status-success h-2 rounded-full"
              style={{ width: `${rate}%` }}
            />
          </div>
          <span className="font-semibold text-sm">{rate}%</span>
        </div>
      ),
      sorter: (a, b) => parseFloat(a.completion_rate) - parseFloat(b.completion_rate),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  const filteredWorkouts = workouts.filter((workout) => {
    const categoryMatch =
      filterCategory === 'all' || workout.category === filterCategory;
    const difficultyMatch =
      filterDifficulty === 'all' || workout.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const categories = [...new Set(workouts.map((w) => w.category).filter(Boolean))];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Workout Overview</h1>
        <Button icon={<ReloadOutlined />} onClick={fetchWorkouts}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Workouts"
              value={stats.totalWorkouts}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#7B68A6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Most Popular Category"
              value={stats.mostPopularCategory}
              valueStyle={{ color: '#e7b85c', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Avg Duration"
              value={stats.avgDuration}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gradient-card">
            <Statistic
              title="Total Sessions"
              value={stats.totalSessions}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Space className="w-full" direction="vertical" size="middle">
          <Input
            placeholder="Search workouts by title..."
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Space>
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
            <Select
              value={filterDifficulty}
              onChange={setFilterDifficulty}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Difficulties</Select.Option>
              {difficulties.map((diff) => (
                <Select.Option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Workouts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredWorkouts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Workout Details Modal */}
      <Modal
        title="Workout Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedWorkout && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Title" span={2}>
                {selectedWorkout.title}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color={getCategoryColor(selectedWorkout.category)}>
                  {selectedWorkout.category}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Difficulty">
                <Tag color={getDifficultyColor(selectedWorkout.difficulty)}>
                  {selectedWorkout.difficulty}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {selectedWorkout.duration_minutes} minutes
              </Descriptions.Item>
              <Descriptions.Item label="Total Sessions">
                {selectedWorkout.sessions_count}
              </Descriptions.Item>
              <Descriptions.Item label="Completion Rate" span={2}>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-primary-lavender-light rounded-full h-3">
                    <div
                      className="bg-status-success h-3 rounded-full"
                      style={{ width: `${selectedWorkout.completion_rate}%` }}
                    />
                  </div>
                  <span className="font-semibold">{selectedWorkout.completion_rate}%</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedWorkout.description || 'No description available'}
              </Descriptions.Item>
              <Descriptions.Item label="Instructions" span={2}>
                {selectedWorkout.instructions || 'No instructions available'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Workouts;
