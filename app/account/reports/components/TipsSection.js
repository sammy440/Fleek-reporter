"use client";

export default function TipsSection() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Writing Tips */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 dark:text-white text-gray-900">
          Writing Tips
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✅</span>
            <span>
              Use a clear, descriptive title that summarizes your report
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✅</span>
            <span>Include who, what, when, where, and why in your content</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✅</span>
            <span>Keep your language neutral and factual</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✅</span>
            <span>Add images or videos to make your report more engaging</span>
          </li>
        </ul>
      </div>

      {/* Media Guidelines */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 dark:text-white text-gray-900">
          Media Guidelines
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">📷</span>
            <span>Images: JPEG, PNG, GIF, WebP (max 10MB each)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-red-500 mt-0.5">🎥</span>
            <span>Videos: MP4, MPEG, MOV, AVI (max 50MB each)</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-purple-500 mt-0.5">📌</span>
            <span>Upload multiple files to create rich media reports</span>
          </li>
        </ul>
      </div>

      {/* Additional Tips - Only visible on larger screens */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
        <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-blue-900">
          Pro Tips
        </h3>
        <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="text-yellow-500 mt-0.5">💡</span>
            <span>Save drafts frequently to avoid losing your work</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-500 mt-0.5">💡</span>
            <span>Use location tags to help readers find local news</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-yellow-500 mt-0.5">💡</span>
            <span>
              Choose appropriate categories for better discoverability
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
