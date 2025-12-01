import React, { useEffect, useState } from 'react';
import { checkApiKey, promptForApiKey } from '../services/geminiService';

interface ApiKeySelectorProps {
  onReady: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onReady }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const verifyKey = async () => {
    setLoading(true);
    try {
      const exists = await checkApiKey();
      setHasKey(exists);
      if (exists) {
        onReady();
      }
    } catch (e) {
      console.error("Error checking API key", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyKey();
  }, []);

  const handleSelectKey = async () => {
    await promptForApiKey();
    setTimeout(verifyKey, 500);
  };

  if (loading) {
    return <div className="text-gray-500 text-xs font-bold">Checking Key...</div>;
  }

  if (hasKey) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-300 rounded-full text-green-700 text-xs font-bold">
        <span className="flex h-2 w-2 rounded-full bg-green-600"></span>
        Ready
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-1">
      <button
        onClick={handleSelectKey}
        className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
      >
        Set API Key
      </button>
    </div>
  );
};

export default ApiKeySelector;