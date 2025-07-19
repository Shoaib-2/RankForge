
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen dashboard-bg flex">
      {/* Modern Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;