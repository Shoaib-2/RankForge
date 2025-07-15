
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Modern Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-72">
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