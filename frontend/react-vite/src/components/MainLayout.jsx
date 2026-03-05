import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = () => {
    return (
        <div className="app-shell">
            <Sidebar />
            <div className="content-shell">
                <Header />
                <main className="content-scroll">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
