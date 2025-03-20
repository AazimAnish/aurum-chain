export const goldPrices = {
  // Historical prices (per gram of 24K gold in INR)
  "2020-01": { purchasePrice: 4284, marketPrice: 4284 },
  "2020-02": { purchasePrice: 4375, marketPrice: 4375 },
  "2020-03": { purchasePrice: 4453, marketPrice: 4453 },
  "2020-04": { purchasePrice: 4714, marketPrice: 4714 },
  "2020-05": { purchasePrice: 4736, marketPrice: 4736 },
  "2020-06": { purchasePrice: 4842, marketPrice: 4842 },
  "2020-07": { purchasePrice: 5021, marketPrice: 5021 },
  "2020-08": { purchasePrice: 5458, marketPrice: 5458 },
  "2020-09": { purchasePrice: 5156, marketPrice: 5156 },
  "2020-10": { purchasePrice: 5089, marketPrice: 5089 },
  "2020-11": { purchasePrice: 4982, marketPrice: 4982 },
  "2020-12": { purchasePrice: 4912, marketPrice: 4912 },

  "2021-01": { purchasePrice: 4957, marketPrice: 4957 },
  "2021-02": { purchasePrice: 4669, marketPrice: 4669 },
  "2021-03": { purchasePrice: 4503, marketPrice: 4503 },
  "2021-04": { purchasePrice: 4612, marketPrice: 4612 },
  "2021-05": { purchasePrice: 4825, marketPrice: 4825 },
  "2021-06": { purchasePrice: 4728, marketPrice: 4728 },
  "2021-07": { purchasePrice: 4789, marketPrice: 4789 },
  "2021-08": { purchasePrice: 4745, marketPrice: 4745 },
  "2021-09": { purchasePrice: 4662, marketPrice: 4662 },
  "2021-10": { purchasePrice: 4728, marketPrice: 4728 },
  "2021-11": { purchasePrice: 4789, marketPrice: 4789 },
  "2021-12": { purchasePrice: 4812, marketPrice: 4812 },

  "2022-01": { purchasePrice: 4843, marketPrice: 4843 },
  "2022-02": { purchasePrice: 4958, marketPrice: 4958 },
  "2022-03": { purchasePrice: 5234, marketPrice: 5234 },
  "2022-04": { purchasePrice: 5185, marketPrice: 5185 },
  "2022-05": { purchasePrice: 5089, marketPrice: 5089 },
  "2022-06": { purchasePrice: 5109, marketPrice: 5109 },
  "2022-07": { purchasePrice: 5021, marketPrice: 5021 },
  "2022-08": { purchasePrice: 5156, marketPrice: 5156 },
  "2022-09": { purchasePrice: 5023, marketPrice: 5023 },
  "2022-10": { purchasePrice: 5089, marketPrice: 5089 },
  "2022-11": { purchasePrice: 5234, marketPrice: 5234 },
  "2022-12": { purchasePrice: 5412, marketPrice: 5412 },

  "2023-01": { purchasePrice: 5623, marketPrice: 5623 },
  "2023-02": { purchasePrice: 5589, marketPrice: 5589 },
  "2023-03": { purchasePrice: 5845, marketPrice: 5845 },
  "2023-04": { purchasePrice: 6012, marketPrice: 6012 },
  "2023-05": { purchasePrice: 6089, marketPrice: 6089 },
  "2023-06": { purchasePrice: 5989, marketPrice: 5989 },
  "2023-07": { purchasePrice: 5923, marketPrice: 5923 },
  "2023-08": { purchasePrice: 5912, marketPrice: 5912 },
  "2023-09": { purchasePrice: 5934, marketPrice: 5934 },
  "2023-10": { purchasePrice: 6023, marketPrice: 6023 },
  "2023-11": { purchasePrice: 6156, marketPrice: 6156 },
  "2023-12": { purchasePrice: 6312, marketPrice: 6312 },

  "2024-01": { purchasePrice: 6323, marketPrice: 6323 },
  "2024-02": { purchasePrice: 6389, marketPrice: 6389 },
  "2024-03": { purchasePrice: 6412, marketPrice: 6412 },
  "2024-04": { purchasePrice: 6445, marketPrice: 6445 },
  "2024-05": { purchasePrice: 6478, marketPrice: 6478 },
  "2024-06": { purchasePrice: 6512, marketPrice: 6512 },
  "2024-07": { purchasePrice: 6545, marketPrice: 6545 },
  "2024-08": { purchasePrice: 6578, marketPrice: 6578 },
  "2024-09": { purchasePrice: 6612, marketPrice: 6612 },
  "2024-10": { purchasePrice: 6645, marketPrice: 6645 },
  "2024-11": { purchasePrice: 6678, marketPrice: 6678 },
  "2024-12": { purchasePrice: 6712, marketPrice: 6712 },

  // Projected prices for 2025
  "2025-01": { purchasePrice: 6745, marketPrice: 6745 },
  "2025-02": { purchasePrice: 6778, marketPrice: 6778 },
  "2025-03": { purchasePrice: 6812, marketPrice: 6812 },
  "2025-04": { purchasePrice: 6845, marketPrice: 6845 },
  "2025-05": { purchasePrice: 6878, marketPrice: 6878 },
  "2025-06": { purchasePrice: 6912, marketPrice: 6912 },
  "2025-07": { purchasePrice: 6945, marketPrice: 6945 },
  "2025-08": { purchasePrice: 6978, marketPrice: 6978 },
  "2025-09": { purchasePrice: 7012, marketPrice: 7012 },
  "2025-10": { purchasePrice: 7045, marketPrice: 7045 },
  "2025-11": { purchasePrice: 7078, marketPrice: 7078 },
  "2025-12": { purchasePrice: 7112, marketPrice: 7112 },
};

// Helper function to get gold price for a specific date
export const getGoldPrice = (date: string) => {
  const yearMonth = date.substring(0, 7); // Format: YYYY-MM
  
  // First try exact match
  const exactMatch = goldPrices[yearMonth as keyof typeof goldPrices];
  if (exactMatch) return exactMatch;
  
  // If no exact match, find the nearest available date
  console.log(`No exact match for ${yearMonth}, finding closest available date`);
  
  try {
    // Get all available dates from the goldPrices object
    const availableDates = Object.keys(goldPrices).sort();
    
    // If the date is before our earliest data, use the earliest
    if (yearMonth < availableDates[0]) {
      console.log(`Date ${yearMonth} is before our earliest data (${availableDates[0]}), using earliest available`);
      return goldPrices[availableDates[0] as keyof typeof goldPrices];
    }
    
    // If the date is after our latest data, use the latest
    if (yearMonth > availableDates[availableDates.length - 1]) {
      console.log(`Date ${yearMonth} is after our latest data (${availableDates[availableDates.length - 1]}), using latest available`);
      return goldPrices[availableDates[availableDates.length - 1] as keyof typeof goldPrices];
    }
    
    // Find the closest date that's earlier than the requested date
    let closestDate = availableDates[0];
    for (const availableDate of availableDates) {
      if (availableDate <= yearMonth && availableDate > closestDate) {
        closestDate = availableDate;
      }
    }
    
    console.log(`Using ${closestDate} as closest match for ${yearMonth}`);
    return goldPrices[closestDate as keyof typeof goldPrices];
  } catch (error) {
    console.error("Error finding closest date:", error);
    
    // As a fallback, use the most recent date
    const fallbackDate = "2024-01"; // Hardcoded fallback
    console.log(`Using fallback date ${fallbackDate} due to error`);
    return goldPrices[fallbackDate as keyof typeof goldPrices];
  }
};

// Helper function to calculate value based on weight and price
export const calculateGoldValue = (weightInGrams: number, pricePerGram: number) => {
  return weightInGrams * pricePerGram;
}; 