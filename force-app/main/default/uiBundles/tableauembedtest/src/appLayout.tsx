import { Outlet } from 'react-router';

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <Outlet />
    </div>
  );
}
