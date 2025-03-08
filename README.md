🔱 CHRYSUS 🔱
=========================

Welcome to the future of gold tracking! 🚀 Our platform uses cutting-edge blockchain technology to bring transparency and trust to the gold industry. From mine to market, we're revolutionizing how gold is traced and traded.

🎯 Who's This For?
------------------

-   💍 Jewelry lovers who want to know their gold's journey
-   ⛏️ Miners showcasing ethical sourcing
-   🏭 Refiners and manufacturers proving their quality
-   🏪 Retailers building customer trust
-   💼 Investors seeking transparency in gold trading

💡 What We Offer
----------------

-   **🔍 Unbreakable Traceability**: Follow your gold's journey from mine to masterpiece
-   **🔐 Blockchain-Backed Security**: Every nugget, every transaction, securely recorded
-   **📜 Digital Certificates**: Authenticity at your fingertips
-   **🌐 Real-Time Updates**: Track your gold's location and status anytime, anywhere
-   **🤝 Connect the Gold Community**: Bringing miners, makers, and buyers together

💪 Features That Shine
----------------------

1.  **🏷️ Smart Tagging**:
    -   Each gold batch gets a unique digital ID
    -   QR codes and laser engravings link physical gold to blockchain records
2.  **📱 User-Friendly Dashboard**:
    -   For Customers: Track your gold's origin and journey
    -   For Suppliers: Manage inventory and prove authenticity
    -   For Admins: Oversee the entire ecosystem
3.  **🔄 Real-Time Tracking**:
    -   Watch your gold move through each stage of production
    -   Get alerts on significant milestones
4.  **🏅 Quality Assurance**:
    -   Certification details stored securely on the blockchain
    -   Verify purity and authenticity with a single click

📄 Pages & Functionalities
--------------------------

1.  **🏠 Home Page**:
    -   Platform overview
    -   Latest tracked gold items
    -   Quick search functionality
2.  **🔎 Product Tracking Page**:
    -   Enter product ID or scan QR code
    -   View detailed journey of the gold item
    -   Interactive timeline of the product's history
3.  **➕ Product Registration Page** (for Suppliers):
    -   Register new gold batches
    -   Update product status and location
    -   Upload certification documents
4.  **👤 User Dashboard**:
    -   For Customers: View owned products, tracking history
    -   For Suppliers: Manage inventory, view sales data
    -   For Admins: User management, system analytics
5.  **📊 Analytics Page** (for Admins):
    -   Overall system usage statistics
    -   Supply chain bottleneck identification
    -   Fraud detection alerts
6.  **ℹ️ About & FAQ Page**:
    -   Detailed explanation of the platform
    -   Frequently asked questions
    -   Contact information

📜 Smart Contract Functions
---------------------------

1.  `registerProduct(uint256 _productId, string _origin, uint256 _quantity)`:
    -   Registers a new gold product on the blockchain
2.  `updateProductStatus(uint256 _productId, string _newStatus, string _location)`:
    -   Updates the status and location of a product
3.  `transferOwnership(uint256 _productId, address _newOwner)`:
    -   Transfers ownership of a product to a new address
4.  `verifyCertification(uint256 _productId, string _certificationHash)`:
    -   Verifies and stores certification information for a product
5.  `getProductHistory(uint256 _productId) returns (History[])`:
    -   Retrieves the complete history of a product

🛠️ Tech Stack
--------------

-   **Frontend**: Next.js, Shadcn, Tailwind CSS
-   **Blockchain**: Eth Scaffold-2 on Base (Coinbase's L2 EVM chain)
-   **Additional**: Mapping library (e.g., Mapbox), Data visualization (e.g., D3.js)

### 🏗️ Eth Scaffold-2

Eth Scaffold-2 provides:

-   Pre-configured development environment for Ethereum dApps
-   Integration with popular Ethereum development tools
-   Customizable components for blockchain interactions
-   Built-in security best practices

### 🚀 Why Base L2?

We're using Base, an Ethereum L2 scaling solution, because:

-   💨 Faster Transactions: Crucial for real-time tracking
-   💰 Lower Fees: Makes micro-transactions feasible
-   🌿 Energy Efficient: Aligns with our sustainability goals
-   🔗 Ethereum Compatibility: Leverages the robust Ethereum ecosystem
-   🏢 Backed by Coinbase: Provides institutional trust and stability

💰 Market Potential
-------------------

The global gold market is massive, with a market cap exceeding $11 trillion as of 2021. Our platform taps into this market by:

-   Addressing the $25 billion annual issue of gold fraud
-   Enhancing the $348 billion jewelry market with authenticated pieces
-   Supporting the $182 billion gold mining industry with transparent sourcing

🌟 The Gold Journey: From Earth to Elegance
-------------------------------------------

1.  **⛏️ Mining**: Ore extracted, given a unique blockchain ID
2.  **🚚 Transportation**: Every move tracked and recorded
3.  **⚗️ Processing & Refining**: Each step logged for quality assurance
4.  **🖌️ Crafting**: Transformation into beautiful jewelry, each piece uniquely identified
5.  **🏆 Certification**: Quality verified and permanently recorded
6.  **🛍️ Retail**: Full history available to the discerning buyer
7.  **💖 Ownership**: Customers can trace their gold's entire journey

🤔 Why It Matters
-----------------

-   **🌿 Ethical Sourcing**: Support responsible mining practices
-   **🛡️ Fraud Prevention**: Say goodbye to counterfeit gold
-   **💎 Value Addition**: Authenticated gold commands premium prices
-   **🌍 Sustainability**: Encourage and reward eco-friendly gold production

🚀 Join the Gold Revolution!
----------------------------

Ready to be part of the future of gold? Whether you're a gold enthusiast, a jewelry maker, or a tech-savvy investor, there's a place for you in our golden ecosystem.

Let's make the gold industry shine brighter, together! ✨

# Aurum-Chain: Blockchain-Powered Gold Tracking

## New Development Experience

We've optimized the project for better performance and simplified the development workflow:

### Running the Project (New Simplified Method)

To start the entire development environment with a single command:

```bash
yarn dev-all
```

This command will:
1. Install all dependencies
2. Start the Hardhat local blockchain
3. Deploy contracts to the local blockchain
4. Generate necessary files
5. Start the Next.js development server with hot reload

### Performance Optimizations

We've made several optimizations to improve the project's performance:

1. **Optimized DotPattern component** - Reduced the number of rendered dots and added memoization
2. **Next.js Config Optimization** - Added SWC minification and other production optimizations
3. **React Query Improvements** - Configured with optimal caching strategies
4. **Tailwind CSS Optimization** - Improved build performance with JIT mode
5. **Page Transitions** - Smoother navigation between pages

### Original Commands (Still Available)

You can still use the individual commands if needed:

```bash
# Start local blockchain
yarn chain

# Deploy contracts
yarn deploy

# Generate contract types
yarn generate

# Start Next.js dev server
yarn start
```
