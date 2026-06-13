import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const TwoFactorModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  isLoading = false,
  error = null 
}: TwoFactorModalProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Please enter the 6-digit code from your authenticator app to complete your login.
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                value={code}
                onChange={handleInputChange}
                maxLength={6}
                required
                className="text-center text-lg font-mono tracking-widest"
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading || code.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500 text-center">
            Don't have an authenticator app? Try{' '}
            <a 
              href="https://authy.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Authy
            </a>{' '}
            or{' '}
            <a 
              href="https://support.google.com/accounts/answer/1066447" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Authenticator
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
