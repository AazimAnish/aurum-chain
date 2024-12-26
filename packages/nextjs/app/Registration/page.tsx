"use client";

import { useState } from "react";
import { Button } from "../../~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../~/components/ui/card";
import { Input } from "../../~/components/ui/input";
import { Label } from "../../~/components/ui/label";
import { Textarea } from "../../~/components/ui/textarea";
import { Clipboard } from "lucide-react";
import { createPublicClient, http } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { hardhat } from "viem/chains";
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
    const args = [
      formData.weight,
      formData.purity,
      formData.description,
      formData.certificationDetails,
      formData.certificationDate,
      formData.mineLocation,
      formData.parentGoldId ? (formData.parentGoldId as `0x${string}`) : "0x000000000000000000000000",
    ] as const;

    const result = await writeGoldLedgerAsync({
      functionName: "registerGold",
      args,
    });
    if (!result) {
      throw new Error("Failed to write to contract");
    }

    const publicClient = createPublicClient({
      chain: hardhat,
      transport: http(),
    });
    console.log("Public Client", publicClient);
    // Wait for transaction receipt
    const receipt = await waitForTransactionReceipt(publicClient, {
      hash: result,
      timeout: 240000,
    });

    if (receipt.logs && receipt.logs.length > 0) {
      const log = receipt.logs[0];

      console.log("Gold registered successfully");

      setHallmarkId(log.topics?.[1]?.slice(0, 26) ?? "No identifier found");
      setShowSuccess(true);

      console.log("Hallmark ID:", hallmarkId);
      console.log("Show Success:", showSuccess);
      console.log("Unique Identifier", log.topics?.[1]?.slice(0, 26) ?? "No identifier found");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-white">
      <Card className="w-full max-w-2xl p-4">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">Gold Registration</CardTitle>
          <CardDescription className="text-center text-white">Register your gold with details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">
                  Weight (in grams or ounces)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="text-white w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purity" className="text-white">
                  Purity
                </Label>
                <Input
                  id="purity"
                  name="purity"
                  value={formData.purity}
                  onChange={handleChange}
                  placeholder="e.g., 24K, 22K, 18K"
                  className="text-white w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="text-white w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationDetails" className="text-white">
                Certification Details
              </Label>
              <Input
                id="certificationDetails"
                name="certificationDetails"
                value={formData.certificationDetails}
                onChange={handleChange}
                className="text-white w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="certificationDate" className="text-white">
                Certification Date
              </Label>
              <Input
                id="certificationDate"
                name="certificationDate"
                type="date"
                value={formData.certificationDate}
                onChange={handleChange}
                className="text-white w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mineLocation" className="text-white">
                Mine Location
              </Label>
              <Input
                id="mineLocation"
                name="mineLocation"
                value={formData.mineLocation}
                onChange={handleChange}
                className="text-white w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentGoldId" className="text-white">
                Parent Gold ID
              </Label>
              <Input
                id="parentGoldId"
                name="parentGoldId"
                value={formData.parentGoldId}
                onChange={handleChange}
                className="text-white w-full"
                placeholder="Leave blank if not applicable"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="mt-4 sm:mt-6 md:mt-8">
          <Button type="submit" onClick={handleSubmit} className="w-full text-black">
            Register Gold
          </Button>
        </CardFooter>
      </Card>
      {showSuccess && (
        <Card className="mt-4 p-2 w-1/3">
          <CardContent className="text-white pl-8 flex items-center">
            <p className="font-mono mr-2">Hallmark ID: {hallmarkId}</p>
            <Clipboard
              className="h-5 w-5 cursor-pointer text-gray-300 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(hallmarkId);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000); // Reset success message after 2 seconds
              }}
            />
          </CardContent>
          {copySuccess && <div className="text-green-500 text-sm pl-8">Copied to clipboard!</div>}
        </Card>
      )}
    </div>
  );
};

export default GoldRegistration;
