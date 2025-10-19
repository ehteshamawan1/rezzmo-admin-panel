import { useState } from 'react';
import { Table, Button, Input, Tag, Space, Card, Badge } from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const Trainers = () => {
  const [searchText, setSearchText] = useState('');

  // Mock trainer data - will be replaced with real Supabase data
  const mockTrainers = [
    {
      key: '1',
      id: 'trainer-001',
      name: 'Sarah Williams',
      email: 'sarah.w@rezzmo.com',
      specialization: 'Strength Training',
      status: 'approved',
      clients: 28,
      rating: 4.8,
      joinDate: '2024-11-20',
    },
    {
      key: '2',
      id: 'trainer-002',
      name: 'Carlos Martinez',
      email: 'carlos.m@rezzmo.com',
      specialization: 'Yoga & Flexibility',
      status: 'approved',
      clients: 42,
      rating: 4.9,
      joinDate: '2024-10-15',
    },
    {
      key: '3',
      id: 'trainer-003',
      name: 'Emily Chen',
      email: 'emily.c@rezzmo.com',
      specialization: 'HIIT & Cardio',
      status: 'pending',
      clients: 0,
      rating: 0,
      joinDate: '2025-10-18',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'approved' ? 'green' : status === 'pending' ? 'orange' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Approved', value: 'approved' },
        { text: 'Pending', value: 'pending' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Clients',
      dataIndex: 'clients',
      key: 'clients',
      sorter: (a, b) => a.clients - b.clients,
      render: (clients) => <Badge count={clients} showZero color="#0891b2" />,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      sorter: (a, b) => a.rating - b.rating,
      render: (rating) => (
        <span className="font-semibold">
          {rating > 0 ? `⭐ ${rating.toFixed(1)}` : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="View details"
          />
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                size="small"
                className="text-green-600"
                title="Approve trainer"
              />
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                size="small"
                danger
                title="Reject trainer"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const filteredTrainers = mockTrainers.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchText.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(searchText.toLowerCase())
  );

  // Count pending approvals
  const pendingCount = mockTrainers.filter((t) => t.status === 'pending').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-charcoal">
            Trainer Management
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-status-warning mt-1">
              ⚠️ {pendingCount} trainer{pendingCount > 1 ? 's' : ''} pending approval
            </p>
          )}
        </div>
        <Button type="primary" icon={<UserAddOutlined />} disabled>
          Add Trainer
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-4">
        <Input
          placeholder="Search trainers by name, email, or specialization..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
        />
      </Card>

      {/* Trainers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTrainers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} trainers`,
          }}
        />
      </Card>

      {/* Placeholder Notice */}
      <Card className="mt-6 bg-neutral-ice border-primary">
        <div className="text-center py-4">
          <p className="text-neutral-charcoal font-semibold mb-2">
            🏋️ Trainer Management Placeholder
          </p>
          <p className="text-sm text-neutral-medium">
            This is a placeholder with mock data. Real trainer management features
            (approve/reject, view profiles, manage bookings) will be implemented in future milestones.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Trainers;
