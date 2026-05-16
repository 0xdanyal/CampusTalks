import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingBottom: '5rem', paddingTop: '1rem', minHeight: 'calc(100vh - 80px)' }}>
        <Outlet />
      </main>
    </>
  );
};
