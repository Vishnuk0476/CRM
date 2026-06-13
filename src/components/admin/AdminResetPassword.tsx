import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AdminResetPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/reset-password.php', {
      method: 'POST',
      body: new URLSearchParams({ action: 'request', email })
    });
    if (res.ok) setSent(true);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Reset Admin Password</h2>
      {sent ? (
        <Alert><AlertDescription>If the account exists, a reset link has been sent.</AlertDescription></Alert>
      ) : (
        <form onSubmit={handleRequest} className="space-y-4">
          <Input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      )}
    </div>
  );
};
