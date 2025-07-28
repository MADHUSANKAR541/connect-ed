import React from 'react';

export default function WaitForApprovalPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <div style={{ background: 'var(--card)', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>⏳ Wait for Approval</h1>
        <p style={{ fontSize: 18, color: 'var(--muted-foreground)' }}>
          Your account is pending approval by an administrator.<br />
          You will receive an email once your account is approved.<br />
          Please check back later!
        </p>
      </div>
    </div>
  );
} 