import { useState } from 'react';
import { Table, Button, Input, Tag, Space, Card } from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from '@ant-design/icons';

const Users = () => {
  const [searchText, setSearchText] = useState('');

  // Mock user data - will be replaced with real Supabase data
  const mockUsers = [
    {
      key: '1',
      id: 'user-001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2025-01-15',
      workouts: 45,
    },
    {
      key: '2',
      id: 'user-002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2025-02-10',
      workouts: 32,
    },
    {
      key: '3',
      id: 'user-003',
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      role: 'user',
      status: 'suspended',
      joinDate: '2024-12-01',
      workouts: 12,
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
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Workouts',
      dataIndex: 'workouts',
      key: 'workouts',
      sorter: (a, b) => a.workouts - b.workouts,
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a, b) => new Date(a.joinDate) - new Date(b.joinDate),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Edit user"
          />
          <Button
            type="text"
            icon={<LockOutlined />}
            size="small"
            title={record.status === 'active' ? 'Ban user' : 'Unban user'}
            danger={record.status === 'active'}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            title="Delete user"
          />
        </Space>
      ),
    },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-charcoal">
          User Management
        </h1>
        <Button type="primary" icon={<UserAddOutlined />} disabled>
          Add User
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="mb-4">
        <Input
          placeholder="Search users by name or email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
        />
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      {/* Placeholder Notice */}
      <Card className="mt-6 bg-neutral-ice border-primary">
        <div className="text-center py-4">
          <p className="text-neutral-charcoal font-semibold mb-2">
            👥 User Management Placeholder
          </p>
          <p className="text-sm text-neutral-medium">
            This is a placeholder with mock data. Real user management features
            (view, edit, ban/unban, delete) will be implemented in future milestones.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Users;
