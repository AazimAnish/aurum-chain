import Arweave from 'arweave';

// Initialize Arweave - Use ArLocal for free local development
const arweave = Arweave.init({
  host: 'localhost',  // Using ArLocal running locally
  port: 1984,         // Default ArLocal port
  protocol: 'http',   // Using http for local development
  timeout: 20000,
  logging: false,
});

// Interface for gold registration data
export interface GoldRegistrationData {
  uniqueIdentifier: string;
  owner: string;
  weight: string;
  purity: string;
  description: string;
  certificationDetails: string;
  certificationDate: string;
  mineLocation: string;
  parentGoldId?: string;
  tokenAmount?: string;
  timestamp: number;
}

// Interface for user gold holdings
export interface UserGoldHoldings {
  address: string;
  goldIds: string[];
  totalTokens: string;
  registrations: GoldRegistrationData[];
}

// For development without ArLocal, simulate transaction ID
const simulateArweaveStorage = (data: GoldRegistrationData): Promise<string> => {
  return new Promise((resolve) => {
    // Create a deterministic but unique ID based on the data
    const fakeId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    // Store in localStorage for simulation
    const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
    storedData[fakeId] = data;
    localStorage.setItem('arweaveSimulation', JSON.stringify(storedData));
    // Simulate network delay
    setTimeout(() => resolve(fakeId), 500);
  });
};

/**
 * Store gold registration data on Arweave (or simulated storage)
 * @param data The gold registration data to store
 * @param jwk The JWK wallet key
 * @returns The transaction ID
 */
export const storeGoldRegistration = async (
  data: GoldRegistrationData,
  jwk: any
): Promise<string> => {
  try {
    // Check if using simulation or real storage - ArLocal check
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // If we're in development mode, use simulation for simplicity
    if (isLocalhost) {
      try {
        // First try ArLocal if it's running
        // Create transaction
        const transaction = await arweave.createTransaction({
          data: JSON.stringify(data),
        }, jwk);

        // Add tags to make data queryable
        transaction.addTag('Content-Type', 'application/json');
        transaction.addTag('App-Name', 'AurumChain');
        transaction.addTag('Type', 'gold-registration');
        transaction.addTag('Owner', data.owner);
        transaction.addTag('Gold-ID', data.uniqueIdentifier);
        
        if (data.tokenAmount) {
          transaction.addTag('Token-Amount', data.tokenAmount);
        }

        // Sign transaction
        await arweave.transactions.sign(transaction, jwk);

        // Submit transaction
        const response = await arweave.transactions.post(transaction);

        if (response.status === 200 || response.status === 202) {
          console.log("ArLocal storage successful");
          return transaction.id;
        } 
      } catch (error) {
        console.log("ArLocal not running, using simulated storage");
        return await simulateArweaveStorage(data);
      }
      
      // Fallback to simulation if ArLocal fails
      return await simulateArweaveStorage(data);
    }
    
    // For production, use real Arweave network
    // Create transaction
    const transaction = await arweave.createTransaction({
      data: JSON.stringify(data),
    }, jwk);

    // Add tags to make data queryable
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('App-Name', 'AurumChain');
    transaction.addTag('Type', 'gold-registration');
    transaction.addTag('Owner', data.owner);
    transaction.addTag('Gold-ID', data.uniqueIdentifier);
    
    if (data.tokenAmount) {
      transaction.addTag('Token-Amount', data.tokenAmount);
    }

    // Sign transaction
    await arweave.transactions.sign(transaction, jwk);

    // Submit transaction
    const response = await arweave.transactions.post(transaction);

    if (response.status === 200 || response.status === 202) {
      return transaction.id;
    } else {
      throw new Error(`Failed to submit transaction: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error storing data on Arweave:', error);
    throw error;
  }
};

/**
 * Get all gold registrations for a specific address
 * @param address The wallet address
 * @returns Promise with user's gold holdings
 */
export const getUserGoldHoldings = async (address: string): Promise<UserGoldHoldings> => {
  try {
    // Check if using simulation
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      try {
        // First try ArLocal if it's running
        // GraphQL query to find all transactions for this address
        const query = `
          query {
            transactions(
              tags: [
                { name: "App-Name", values: ["AurumChain"] },
                { name: "Type", values: ["gold-registration"] },
                { name: "Owner", values: ["${address}"] }
              ]
            ) {
              edges {
                node {
                  id
                  tags {
                    name
                    value
                  }
                }
              }
            }
          }
        `;

        const response = await arweave.api.post('/graphql', { query });
        
        if (response.data && response.data.data && response.data.data.transactions) {
          const edges = response.data.data.transactions.edges;
          const goldIds: string[] = [];
          const registrations: GoldRegistrationData[] = [];
          let totalTokens = 0;

          // Process each transaction
          for (const edge of edges) {
            const txId = edge.node.id;
            
            // Get the Gold-ID from tags
            const goldIdTag = edge.node.tags.find((tag: any) => tag.name === 'Gold-ID');
            const tokenAmountTag = edge.node.tags.find((tag: any) => tag.name === 'Token-Amount');
            
            if (goldIdTag) {
              goldIds.push(goldIdTag.value);
            }
            
            if (tokenAmountTag) {
              totalTokens += parseInt(tokenAmountTag.value, 10);
            }
            
            // Get transaction data
            const txData = await arweave.transactions.getData(txId, { decode: true, string: true });
            if (txData) {
              try {
                const registrationData = JSON.parse(txData as string) as GoldRegistrationData;
                registrations.push(registrationData);
              } catch (e) {
                console.error('Error parsing transaction data:', e);
              }
            }
          }

          return {
            address,
            goldIds,
            totalTokens: totalTokens.toString(),
            registrations,
          };
        }
      } catch (error) {
        console.log("ArLocal not running or query failed, using simulated storage");
      }
      
      // Fallback to simulation data
      const storedData = JSON.parse(localStorage.getItem('arweaveSimulation') || '{}');
      const registrations: GoldRegistrationData[] = [];
      const goldIds: string[] = [];
      let totalTokens = 0;
      
      // Process simulation data
      Object.keys(storedData).forEach(id => {
        const data = storedData[id] as GoldRegistrationData;
        if (data.owner === address) {
          registrations.push(data);
          if (data.uniqueIdentifier) goldIds.push(data.uniqueIdentifier);
          if (data.tokenAmount) totalTokens += parseInt(data.tokenAmount, 10);
        }
      });
      
      return {
        address,
        goldIds,
        totalTokens: totalTokens.toString(),
        registrations,
      };
    }
    
    // For production, use real Arweave network
    // GraphQL query to find all transactions for this address
    const query = `
      query {
        transactions(
          tags: [
            { name: "App-Name", values: ["AurumChain"] },
            { name: "Type", values: ["gold-registration"] },
            { name: "Owner", values: ["${address}"] }
          ]
        ) {
          edges {
            node {
              id
              tags {
                name
                value
              }
            }
          }
        }
      }
    `;

    const response = await arweave.api.post('/graphql', { query });
    
    if (!response.data || !response.data.data || !response.data.data.transactions) {
      return {
        address,
        goldIds: [],
        totalTokens: '0',
        registrations: [],
      };
    }

    const edges = response.data.data.transactions.edges;
    const goldIds: string[] = [];
    const registrations: GoldRegistrationData[] = [];
    let totalTokens = 0;

    // Process each transaction
    for (const edge of edges) {
      const txId = edge.node.id;
      
      // Get the Gold-ID from tags
      const goldIdTag = edge.node.tags.find((tag: any) => tag.name === 'Gold-ID');
      const tokenAmountTag = edge.node.tags.find((tag: any) => tag.name === 'Token-Amount');
      
      if (goldIdTag) {
        goldIds.push(goldIdTag.value);
      }
      
      if (tokenAmountTag) {
        totalTokens += parseInt(tokenAmountTag.value, 10);
      }
      
      // Get transaction data
      const txData = await arweave.transactions.getData(txId, { decode: true, string: true });
      if (txData) {
        try {
          const registrationData = JSON.parse(txData as string) as GoldRegistrationData;
          registrations.push(registrationData);
        } catch (e) {
          console.error('Error parsing transaction data:', e);
        }
      }
    }

    return {
      address,
      goldIds,
      totalTokens: totalTokens.toString(),
      registrations,
    };
  } catch (error) {
    console.error('Error fetching user gold holdings:', error);
    throw error;
  }
};

/**
 * Generate a new Arweave wallet
 * @returns The JWK wallet key
 */
export const generateWallet = async (): Promise<any> => {
  return await arweave.wallets.generate();
};

/**
 * Get wallet address from JWK
 * @param jwk The JWK wallet key
 * @returns The wallet address
 */
export const getWalletAddress = async (jwk: any): Promise<string> => {
  return await arweave.wallets.jwkToAddress(jwk);
};

export default arweave; 