import { Outlet } from 'react-router';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-white">
      <Outlet />
    </div>
  );
}
