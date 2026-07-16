import { Outlet } from 'react-router';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-white">
      <div className="absolute left-2 top-2 z-50 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
        VizVoice loaded
      </div>
      <Outlet />
    </div>
  );
}
