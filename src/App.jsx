import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00879E',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <div className="min-h-screen bg-neutral-offWhite">
          <header className="bg-primary text-white p-6 shadow-md">
            <div className="container mx-auto">
              <h1 className="text-3xl font-bold">Rezzmo Admin Dashboard</h1>
              <p className="text-sm mt-1">Manage your fitness platform</p>
            </div>
          </header>

          <main className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold mb-4">Welcome to Rezzmo Admin Panel</h2>
              <p className="text-neutral-mediumGray">
                This admin dashboard will be fully developed in Milestone 2 and beyond.
              </p>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="border border-neutral-lightGray rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">User Management</h3>
                  <p className="text-sm text-neutral-mediumGray">View and manage all users</p>
                </div>
                <div className="border border-neutral-lightGray rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Content Moderation</h3>
                  <p className="text-sm text-neutral-mediumGray">Review reported content</p>
                </div>
                <div className="border border-neutral-lightGray rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Analytics</h3>
                  <p className="text-sm text-neutral-mediumGray">Platform metrics and insights</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
