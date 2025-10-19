import { useState } from 'react';
import { Table, Button, Tag, Space, Card, Tabs, Badge } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FlagOutlined,
} from '@ant-design/icons';

const Moderation = () => {
  const [activeTab, setActiveTab] = useState('reported');

  // Mock reported content data
  const reportedContent = [
    {
      key: '1',
      id: 'report-001',
      type: 'Challenge Post',
      content: 'Inappropriate language in challenge description',
      reporter: 'user@example.com',
      reported: 'trainer@example.com',
      reason: 'Offensive language',
      status: 'pending',
      date: '2025-10-18',
    },
    {
      key: '2',
      id: 'report-002',
      type: 'Comment',
      content: 'Spam link in workout comment',
      reporter: 'john@example.com',
      reported: 'spammer@example.com',
      reason: 'Spam',
      status: 'pending',
      date: '2025-10-17',
    },
    {
      key: '3',
      id: 'report-003',
      type: 'Profile Image',
      content: 'Inappropriate profile picture',
      reporter: 'user2@example.com',
      reported: 'baduser@example.com',
      reason: 'Inappropriate content',
      status: 'reviewed',
      date: '2025-10-15',
    },
  ];

  // Mock challenges awaiting approval
  const pendingChallenges = [
    {
      key: '1',
      id: 'challenge-001',
      title: '30-Day HIIT Challenge',
      creator: 'trainer1@example.com',
      category: 'HIIT',
      participants: 0,
      status: 'pending',
      created: '2025-10-18',
    },
    {
      key: '2',
      id: 'challenge-002',
      title: 'Yoga for Beginners',
      creator: 'trainer2@example.com',
      category: 'Yoga',
      participants: 0,
      status: 'pending',
      created: '2025-10-17',
    },
  ];

  const reportColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Reporter',
      dataIndex: 'reporter',
      key: 'reporter',
    },
    {
      title: 'Reported User',
      dataIndex: 'reported',
      key: 'reported',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => <Tag color="orange">{reason}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'pending' ? 'gold' : status === 'reviewed' ? 'green' : 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
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
                title="Approve / Dismiss"
              />
              <Button
                type="text"
                icon={<CloseCircleOutlined />}
                size="small"
                danger
                title="Take action"
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const challengeColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="cyan">{category}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color="orange">{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="View details"
          />
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            size="small"
            className="text-green-600"
            title="Approve challenge"
          />
          <Button
            type="text"
            icon={<CloseCircleOutlined />}
            size="small"
            danger
            title="Reject challenge"
          />
        </Space>
      ),
    },
  ];

  const pendingReports = reportedContent.filter((r) => r.status === 'pending').length;
  const pendingChallengesCount = pendingChallenges.length;

  const tabItems = [
    {
      key: 'reported',
      label: (
        <span>
          <FlagOutlined /> Reported Content{' '}
          {pendingReports > 0 && <Badge count={pendingReports} />}
        </span>
      ),
      children: (
        <Table
          columns={reportColumns}
          dataSource={reportedContent}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'challenges',
      label: (
        <span>
          Challenge Approvals{' '}
          {pendingChallengesCount > 0 && <Badge count={pendingChallengesCount} />}
        </span>
      ),
      children: (
        <Table
          columns={challengeColumns}
          dataSource={pendingChallenges}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-charcoal">
            Content Moderation
          </h1>
          {(pendingReports > 0 || pendingChallengesCount > 0) && (
            <p className="text-sm text-status-warning mt-1">
              ⚠️ {pendingReports + pendingChallengesCount} item(s) pending review
            </p>
          )}
        </div>
      </div>

      {/* Tabs for different moderation categories */}
      <Card>
        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
      </Card>

      {/* Placeholder Notice */}
      <Card className="mt-6 bg-neutral-ice border-primary">
        <div className="text-center py-4">
          <p className="text-neutral-charcoal font-semibold mb-2">
            🛡️ Content Moderation Placeholder
          </p>
          <p className="text-sm text-neutral-medium">
            This is a placeholder with mock data. Real content moderation features
            (review reports, approve/reject content, moderate challenges) will be implemented
            in future milestones.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Moderation;
