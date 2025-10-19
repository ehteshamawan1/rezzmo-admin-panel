import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Card } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, WarningOutlined } from '@ant-design/icons';
import { supabase } from '../services/supabase';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== 'admin') {
        // Not an admin - sign out immediately
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Success - redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials or insufficient permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-depth-cyan to-depth-midnight p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-depth-teal mb-2">Rezzmo Admin Panel</h1>
          <p className="text-neutral-medium">Manage your fitness platform</p>
        </div>

        {/* Test Credentials Warning */}
        <Alert
          message="Development Mode"
          description={
            <div>
              <p className="mb-2">
                <strong>Using test credentials:</strong>
              </p>
              <p className="text-sm">
                Email: <code className="bg-neutral-cool px-1">admin@rezzmo.test</code>
              </p>
              <p className="text-sm">
                Password: <code className="bg-neutral-cool px-1">TestAdmin123!</code>
              </p>
              <p className="text-xs mt-2 text-status-warning">
                ⚠️ Will be replaced with actual credentials + 2FA in Milestone 8
              </p>
            </div>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          className="mb-6"
        />

        {/* Error Alert */}
        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            closable
            onClose={() => setError('')}
            className="mb-4"
          />
        )}

        {/* Login Form */}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="admin@rezzmo.test"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              className="w-full"
              size="large"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        {/* No Signup Notice */}
        <div className="text-center mt-6 p-4 bg-neutral-ice rounded-lg">
          <p className="text-sm text-neutral-charcoal">
            <strong>Admin signup is disabled.</strong>
          </p>
          <p className="text-xs text-neutral-medium mt-1">
            Admin accounts can only be created manually in Supabase by authorized personnel.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-neutral-medium">
          <p>Rezzmo - Empowering Your Movement</p>
          <p className="mt-1">© 2025 Cyberix Digital. All rights reserved.</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
