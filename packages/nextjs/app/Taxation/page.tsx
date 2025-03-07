"use client";

import { useEffect, useState } from "react";
import { Button } from "../../~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../~/components/ui/card";
import { Input } from "../../~/components/ui/input";
import { Label } from "../../~/components/ui/label";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getGoldPrice, calculateGoldValue } from "../../constants/goldPrices";

interface GoldDetails {
  uniqueIdentifier: string;
  weight: string;
  purity: string;
  description: string;
  certificationDetails: string;
  certificationDate: string;
  mineLocation: string;
  parentGoldId: string;
  hasParentGoldId: boolean;
}

interface TaxCalculation {
  holdingPeriod: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  purchaseValue: number;
  currentValue: number;
  capitalGains: number;
  details: string;
}

const TaxationPage = () => {
  const [hallmarkId, setHallmarkId] = useState<string>("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [goldDetails, setGoldDetails] = useState<GoldDetails | null>(null);
  const [taxInfo, setTaxInfo] = useState<TaxCalculation | null>(null);

  const { data: allGoldDetails, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "GoldLedger",
    functionName: "getAllGoldDetails",
  });

  const calculateHoldingPeriod = (certificationDate: string) => {
    const certDate = new Date(certificationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - certDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  const calculateTax = (details: GoldDetails) => {
    const holdingPeriod = calculateHoldingPeriod(details.certificationDate);
    const weight = parseFloat(details.weight);
    
    // Get purchase price from certification date
    const purchaseDate = details.certificationDate.substring(0, 7); // YYYY-MM
    const currentDate = new Date().toISOString().substring(0, 7); // Current YYYY-MM
    
    const purchasePriceData = getGoldPrice(purchaseDate);
    const currentPriceData = getGoldPrice(currentDate);
    
    if (!purchasePriceData || !currentPriceData) {
      return null;
    }

    const purchaseValue = calculateGoldValue(weight, purchasePriceData.purchasePrice);
    const currentValue = calculateGoldValue(weight, currentPriceData.marketPrice);
    const capitalGains = currentValue - purchaseValue;

    if (holdingPeriod >= 36) {
      // Long-term Capital Gains Tax (LTCG)
      const taxAmount = capitalGains * 0.208; // 20.8%
      return {
        holdingPeriod,
        taxType: "Long-term Capital Gains Tax (LTCG)",
        taxRate: 20.8,
        taxAmount,
        purchaseValue,
        currentValue,
        capitalGains,
        details: "20.8% tax rate applies (including inflation indexation)"
      };
    } else {
      // For STCG, we'll show the maximum rate scenario
      const taxAmount = capitalGains * 0.30; // Maximum tax slab rate
      return {
        holdingPeriod,
        taxType: "Short-term Capital Gains Tax (STCG)",
        taxRate: 30,
        taxAmount,
        purchaseValue,
        currentValue,
        capitalGains,
        details: "Tax rate depends on your income slab (showing maximum rate of 30%)"
      };
    }
  };

  useEffect(() => {
    if (searchPerformed && hallmarkId !== "") {
      refetch();
    }
  }, [searchPerformed, hallmarkId, refetch]);

  useEffect(() => {
    if (allGoldDetails && hallmarkId) {
      const matchedDetails = (allGoldDetails as unknown as GoldDetails[]).find(
        details => details.uniqueIdentifier === hallmarkId
      );
      setGoldDetails(matchedDetails || null);
      if (matchedDetails) {
        const taxCalculation = calculateTax(matchedDetails);
        setTaxInfo(taxCalculation);
      }
    }
  }, [allGoldDetails, hallmarkId]);

  const handleSearch = () => {
    if (hallmarkId) {
      setSearchPerformed(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 text-white">
      <Card className="w-full max-w-2xl p-4">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
            Gold Tax Calculator
          </CardTitle>
          <CardDescription className="text-center text-white">
            Enter your Gold Hallmark ID to calculate applicable taxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="Enter Hallmark ID"
              value={hallmarkId}
              onChange={e => setHallmarkId(e.target.value)}
              className="text-white w-full"
            />
            <Button onClick={handleSearch} className="text-black">
              Calculate
            </Button>
          </div>

          {isLoading && <p className="mt-4">Loading...</p>}
          {error && <p className="mt-4 text-red-500">Error: {error.message}</p>}

          {goldDetails && taxInfo && (
            <Card className="p-4 mt-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Tax Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="font-bold">Gold Details:</Label>
                    <p>Weight: {goldDetails.weight}</p>
                    <p>Certification Date: {goldDetails.certificationDate}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Holding Period:</Label>
                    <p>{taxInfo.holdingPeriod} months</p>
                  </div>
                  <div>
                    <Label className="font-bold">Tax Type:</Label>
                    <p>{taxInfo.taxType}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Tax Details:</Label>
                    <p>{taxInfo.details}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Purchase Value:</Label>
                    <p>₹{taxInfo.purchaseValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Current Value:</Label>
                    <p>₹{taxInfo.currentValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Capital Gains:</Label>
                    <p>₹{taxInfo.capitalGains.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Estimated Tax Amount:</Label>
                    <p>₹{taxInfo.taxAmount.toFixed(2)}</p>
                  </div>
                  <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
                    <p className="text-yellow-500">
                      Note: For accurate tax calculations, please consult with a tax advisor and provide:
                    </p>
                    <ul className="list-disc ml-6 mt-2 text-yellow-500/80">
                      <li>Purchase value of gold</li>
                      <li>Current market value</li>
                      <li>Your income slab (for STCG)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {searchPerformed && !isLoading && !error && !goldDetails && (
            <p className="mt-4">No gold details found for the given Hallmark ID.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxationPage;