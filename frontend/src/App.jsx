import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import Team from './pages/Team';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#f1f5f9',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }
      }} />
    </QueryClientProvider>
  );
}

export default App;
