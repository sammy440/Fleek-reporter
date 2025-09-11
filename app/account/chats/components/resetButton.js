// Add this component inside your chat header section in page.js

// First, import the additional icons you'll need:
import { RefreshCw, AlertTriangle } from "lucide-react";

// Then add this component after your error banner and before the messages area:

{/* Key Reset Section - Add this after the error banner */}
{error && error.includes("decrypt") && selectedConversation && (
  <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900 border-b border-amber-200 dark:border-amber-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">Decryption Issues Detected</span>
      </div>
      <button
        onClick={async () => {
          const success = await resetConversationKeys(
            selectedConversationId,
            selectedConversation.other_participant.id
          );
          if (success) {
            // Optionally show a success message
            console.log("Keys reset successfully");
          }
        }}
        disabled={initializingKeys}
        className="flex items-center space-x-1 px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {initializingKeys ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <RefreshCw className="w-3 h-3" />
        )}
        <span>Reset Keys</span>
      </button>
    </div>
    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
      If messages won&apos;t decrypt, try resetting the encryption keys for this conversation.
    </p>
  </div>
)}

// Also add this debug info section (optional, for troubleshooting):
{process.env.NODE_ENV === 'development' && selectedConversation && (
  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <details className="text-xs">
      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
        Debug Info
      </summary>
      <div className="mt-2 space-y-1 text-gray-500 dark:text-gray-400">
        <p>Conversation ID: {selectedConversationId}</p>
        <p>Peer ID: {selectedConversation.other_participant?.id}</p>
        <p>Messages: {messages.length} total</p>
        <p>Encrypted: {messages.filter(m => !m.decrypted).length} messages</p>
        <p>Keys initializing: {initializingKeys ? 'Yes' : 'No'}</p>
      </div>
    </details>
  </div>
)}