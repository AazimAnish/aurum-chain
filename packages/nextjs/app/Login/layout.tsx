"use client";

import { Toaster } from 'react-hot-toast';
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden goldman-font-enabled">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50 opacity-50 z-0" />
      
      <main className="relative flex flex-col flex-1 z-10">
        {children}
      </main>
      
      <ProgressBar 
        height="3px" 
        color="#ECBD45" 
        options={{ 
          showSpinner: false,
          minimum: 0.25,
        }} 
        shallowRouting
      />
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#333333',
          },
        }}
      />
    </div>
  );
} 
  