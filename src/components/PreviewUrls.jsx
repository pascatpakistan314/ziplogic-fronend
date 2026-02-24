import { ExternalLink, Monitor, Server, Database, Rocket } from 'lucide-react';

export default function PreviewUrls({ urls }) {
  if (!urls || !urls.frontend) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-6">
        <Rocket className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">ðŸŽ‰ Your App is Running!</h3>
        <div className="flex items-center space-x-2 ml-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {/* Frontend URL */}
        <a
          href={urls.frontend}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition group border border-blue-200"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900">Frontend</div>
              <div className="text-sm text-gray-600">{urls.frontend}</div>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition" />
        </a>
        
        {/* Backend URL */}
        {urls.backend && (
          <a
            href={urls.backend}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition group border border-green-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Backend API</div>
                <div className="text-sm text-gray-600">{urls.backend}</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition" />
          </a>
        )}
        
        {/* Admin URL */}
        {urls.admin && (
          <a
            href={urls.admin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition group border border-purple-200"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Admin Panel</div>
                <div className="text-sm text-gray-600">{urls.admin}</div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition" />
          </a>
        )}
      </div>
      
      {/* Instructions - No iframe! */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <Rocket className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-gray-900 mb-2">ðŸŽ‰ Your App is Running in Docker!</h4>
            <p className="text-sm text-gray-700 mb-3">
              Your complete application is running with all dependencies installed. Click the links above to open in new tabs.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Frontend:</strong> React app with Tailwind, icons, and all modules</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Backend:</strong> API server with database connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-gray-700"><strong>Admin:</strong> Manage your data (add products, users, etc.)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
