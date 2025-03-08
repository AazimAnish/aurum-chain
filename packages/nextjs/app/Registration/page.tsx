"use client";

import { useState } from "react";
import { createPublicClient, http } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { hardhat } from "viem/chains";
import { Clipboard } from "lucide-react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface FormData {
  weight: string;
  purity: string;
  description: string;
  certificationDetails: string;
  certificationDate: string;
  mineLocation: string;
  parentGoldId?: string; // Make parentGoldId optional
}

const GoldRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    weight: "",
    purity: "",
    description: "",
    certificationDetails: "",
    certificationDate: "",
    mineLocation: "",
    parentGoldId: "",
  });

  const { writeContractAsync: writeGoldLedgerAsync } = useScaffoldWriteContract("GoldLedger");
  const [hallmarkId, setHallmarkId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data:", formData);

    try {
      if (!writeGoldLedgerAsync) {
        console.error("Contract write function not available");
        return;
      }

      const txHash = await writeGoldLedgerAsync({
        functionName: "registerGold",
        args: [
          formData.weight,
          formData.purity,
          formData.description,
          formData.certificationDetails,
          formData.certificationDate,
          formData.mineLocation,
          formData.parentGoldId ? formData.parentGoldId as `0x${string}` : "0x0", // Convert to proper hex format
        ],
      });

      console.log("Transaction hash:", txHash);

      if (txHash) {
        const publicClient = createPublicClient({
          chain: hardhat,
          transport: http(),
        });

        const receipt = await waitForTransactionReceipt(publicClient, {
          hash: txHash as `0x${string}`,
          timeout: 240000,
        });

        console.log("Transaction receipt:", receipt);

        if (receipt.logs && receipt.logs.length > 0) {
          const log = receipt.logs[0];
          if (log.topics && log.topics.length > 1) {
            const identifier = log.topics[1];
            if (identifier) {
              setHallmarkId(identifier.slice(0, 26));
              setShowSuccess(true);
              console.log("Hallmark ID set to:", identifier.slice(0, 26));
            } else {
              console.error("Invalid identifier in log topics");
            }
          } else {
            console.error("No topics found in the log");
          }
        } else {
          console.error("No logs found in receipt");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 pb-4 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-center goldman-font text-gray-900">Gold Registration</h1>
            <p className="text-center text-gray-600 mt-2">Register your gold with details</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (in grams or ounces)
                </label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter weight"
                />
              </div>
              <div>
                <label htmlFor="purity" className="block text-sm font-medium text-gray-700 mb-1">
                  Purity
                </label>
                <input
                  type="text"
                  id="purity"
                  name="purity"
                  value={formData.purity}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                  placeholder="e.g., 24K, 22K, 18K"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Describe your gold item"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label htmlFor="certificationDetails" className="block text-sm font-medium text-gray-700 mb-1">
                Certification Details
              </label>
              <input
                type="text"
                id="certificationDetails"
                name="certificationDetails"
                value={formData.certificationDetails}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Enter certification details"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="certificationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Certification Date
              </label>
              <input
                type="date"
                id="certificationDate"
                name="certificationDate"
                value={formData.certificationDate}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="mineLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Mine Location
              </label>
              <input
                type="text"
                id="mineLocation"
                name="mineLocation"
                value={formData.mineLocation}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Enter mine location"
              />
            </div>
            
            <div className="mb-8">
              <label htmlFor="parentGoldId" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Gold ID (if applicable)
              </label>
              <input
                type="text"
                id="parentGoldId"
                name="parentGoldId"
                value={formData.parentGoldId || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Leave blank if not applicable"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                onClick={handleSubmit}
                className="action-button bg-[#ECBD45] text-black hover:bg-[#D9AD3C]"
              >
                Register Gold
              </button>
            </div>
          </form>
          
          {showSuccess && (
            <div className="p-6 border-t border-gray-100">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="text-green-700 font-medium text-center">Gold successfully registered!</div>
                <div className="flex items-center justify-center mt-3 text-gray-700">
                  <div className="mr-2">Your Hallmark ID:</div>
                  <div className="font-mono bg-gray-100 p-2 rounded text-sm">{hallmarkId}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(hallmarkId);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700 p-1"
                  >
                    <Clipboard className="w-5 h-5" />
                  </button>
                </div>
                {copySuccess && <div className="text-green-600 text-sm text-center mt-2">Copied to clipboard!</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoldRegistration;
