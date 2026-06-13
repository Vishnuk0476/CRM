import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TwoFactorSetupProps {
  adminEmail: string;
  onSetupComplete?: () => void;
}

export const TwoFactorSetup = ({ adminEmail, onSetupComplete }: TwoFactorSetupProps) => {
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/two-factor.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'setup' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSecret(data.secret);
      } else {
        setError(data.message || 'Failed to setup 2FA');
      }
    } catch (err: unknown) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/auth/two-factor.php', {
        method: 'POST',
        body: new URLSearchParams({ action: 'disable' })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSecret(null);
        if (onSetupComplete) onSetupComplete();
      } else {
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (err: unknown) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeUrl = (secret: string) => {
    const otpAuthUrl = `otpauth://totp/PanyaGlobal:${adminEmail}?secret=${secret}&issuer=PanyaGlobal`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!secret ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enable 2FA for enhanced security. You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <Button 
              onClick={handleSetup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={generateQRCodeUrl(secret)} 
                alt="QR Code for 2FA Setup"
                className="mx-auto mb-4"
              loading="lazy" decoding="async" />
              <p className="text-sm text-gray-600 mb-2">Scan this QR code with your authenticator app</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Manual Setup Key:</p>
              <Input 
                value={secret} 
                readOnly 
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleDisable}
                disabled={loading}
                className="flex-1"
              >
                Disable 2FA
              </Button>
              <Button 
                onClick={() => window.open('https://authy.com/', '_blank')}
                className="flex-1"
              >
                Download Authy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
