import React, { useState } from 'react';
import { Key, Check, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full water-gradient flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-display">Google Maps API Key</CardTitle>
          <CardDescription>
            Enter your Google Maps API key to enable the map functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={!apiKey.trim()}
              className="w-full h-12 water-gradient"
            >
              <Check className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </form>
          <div className="mt-6 text-center">
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Get API Key from Google Cloud Console
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyInput;
