import React from 'react';
import { Route, Switch } from 'wouter';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreatePost } from './pages/CreatePost';
import { EditPost } from './pages/EditPost';
import { Calendar } from './pages/Calendar';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { UserProvider } from './contexts/UserContext';
import { PostProvider } from './contexts/PostContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <UserProvider>
          <PostProvider>
            <Layout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/create" component={CreatePost} />
                <Route path="/edit/:id" component={EditPost} />
                <Route path="/calendar" component={Calendar} />
                <Route path="/analytics" component={Analytics} />
                <Route path="/settings" component={Settings} />
              </Switch>
            </Layout>
          </PostProvider>
        </UserProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}