"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [anonAadhaar] = useAnonAadhaar();
  const [isMounted, setIsMounted] = useState(false);


 

  const handleVerify = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSuccess(true);
    toast.success('Successfully logged in!', {
      duration: 3000,
      position: 'top-center',
    });
    
    setTimeout(() => {
      router.push("/Registration");
    }, 1000);
  };

  useEffect(() => {
    setIsMounted(true);
    if (anonAadhaar.status === "logged-in") {
      console.log("Logged in successfully:", anonAadhaar);
    }
  }, [anonAadhaar]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <main>
    <div>
      <AnonAadhaarProvider _useTestAadhaar={false} _appName="Aurum Chain">
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="bg-gray-900 p-8 rounded-xl border border-yellow-500/20 shadow-2xl w-full max-w-md">
            <h1 className="text-yellow-500 text-3xl font-bold text-center mb-8 tracking-wider">
              Login with Aadhar
            </h1>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="w-full flex justify-center">
                <LogInWithAnonAadhaar nullifierSeed={1234} />
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || success}
                className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all duration-200
                  ${loading || success 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600 active:transform active:scale-95'
                  } text-black`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Verifying...</span>
                  </div>
                ) : success ? (
                  "Successfully Logged In!"
                ) : (
                  "Verify"
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              {anonAadhaar.status === "logged-in" && (
                <p className="text-green-500">✓ Proof is valid</p>
              )}
            </div>
          </div>
        </div>
      </AnonAadhaarProvider>
    </div>
    </main>
  );
}