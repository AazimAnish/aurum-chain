"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";
import { Button } from "~~/~/components/ui/button";

const LoginPage = () => {
  const [anonAadhaar] = useAnonAadhaar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  // Add state to track simulated login status
  const [simulatedStatus, setSimulatedStatus] = useState<string | null>(null);

  // Get the returnUrl from the URL parameters or default to Registration
  const returnUrl = searchParams.get('returnUrl') || '/Registration';

  // Generate a fixed nullifier seed for development
  // In production, use a secure random value stored in user's localStorage
  const nullifierSeed = 1234567890;

  useEffect(() => {
    console.log("Anon Aadhaar status:", anonAadhaar.status);
    console.log("Return URL after login:", returnUrl);
  }, [anonAadhaar, returnUrl]);

  // Get effective status (either real or simulated)
  const effectiveStatus = simulatedStatus || anonAadhaar.status;

  const handleVerifyAndRedirect = () => {
    // Simulate successful login
    setSimulatedStatus("logged-in");
    
    // Start redirect process
    setRedirecting(true);
    
    // Start countdown timer (3 seconds)
    const timer = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount <= 1) {
          clearInterval(timer);
          // Redirect to the returnUrl instead of hardcoded Registration path
          router.push(returnUrl);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // Determine the button text based on the returnUrl
  const getButtonText = () => {
    if (redirecting) {
      return `Redirecting in ${countdown}...`;
    }
    
    if (returnUrl.includes('/Track')) {
      return "Proceed to Transfer Ownership";
    }
    
    return "Proceed to Registration";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font text-gray-900">Secure Authentication</h1>
            <p className="text-center text-gray-600 mt-2">
              Authenticate with Aadhaar to access the gold registration system
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left side - Login information */}
              <div className="flex flex-col">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Why Aadhaar Authentication?</h2>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 mt-0.5 mr-2">
                        <div className="h-full w-full bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <p className="text-gray-700">Verified identity for secure gold registration</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 mt-0.5 mr-2">
                        <div className="h-full w-full bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <p className="text-gray-700">Privacy-preserving authentication</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 mt-0.5 mr-2">
                        <div className="h-full w-full bg-amber-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      <p className="text-gray-700">Prevents fraud and ensures regulatory compliance</p>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-auto flex items-center justify-center mb-6 md:mb-0">
                  <div className="relative h-32 w-32">
                    <Image 
                      src="/assets/gold-secure.png" 
                      alt="Secure Gold Registration" 
                      fill 
                      className="object-contain opacity-80"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Right side - Login component */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Aadhaar Login</h2>
                <p className="text-gray-600 mb-6 text-center text-sm">
                  Your Aadhaar data remains private and secure
                </p>
                
                <div className="flex justify-center mb-6">
                  <LogInWithAnonAadhaar
                    nullifierSeed={nullifierSeed}
                    fieldsToReveal={["revealAgeAbove18", "revealState"]}
                  />
                </div>
                
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    effectiveStatus === "logged-in" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <span className="mr-2">
                      {effectiveStatus === "logged-in" ? "✅" : "⏳"}
                    </span>
                    <span>
                      {effectiveStatus === "logged-in" 
                        ? "Authenticated" 
                        : effectiveStatus || "Waiting for login"}
                    </span>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={handleVerifyAndRedirect}
                    variant="default"
                    size="lg"
                    className="bg-white text-[#ECBD45] hover:bg-gray-900 w-full font-medium border border-[#ECBD45] p-6 text-lg shadow-lg"
                    disabled={redirecting}
                  >
                    {getButtonText()}
                  </Button>
                  
                  {redirecting && (
                    <p className="mt-4 text-green-600 text-sm animate-pulse">
                      Authentication successful! Redirecting...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;