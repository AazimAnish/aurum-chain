import { UseBalanceParameters, useBalance } from "wagmi";

/**
 * Safe wrapper around wagmi's useBalance hook to avoid provider.on errors.
 */
export const useWatchBalance = (useBalanceParameters: UseBalanceParameters) => {
  try {
    // Use useBalance without adding any extra parameters that could cause issues
    return useBalance(useBalanceParameters);
  } catch (error) {
    console.error("Error in useWatchBalance:", error);
    // Return a placeholder result that matches the structure of useBalance return type
    return {
      data: undefined,
      isError: true,
      isLoading: false,
      status: "error",
      error: error instanceof Error ? error : new Error(String(error))
    } as ReturnType<typeof useBalance>;
  }
};
