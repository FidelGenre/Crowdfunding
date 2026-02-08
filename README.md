# 🚀 Decentralized Crowdfunding

A decentralized Crowdfunding platform (dApp) built on the **Sepolia (Ethereum)** network. It allows users to create campaigns, donate ETH, and withdraw funds securely and transparently using smart contracts optimized for low gas consumption.

## 🛠 Tech Stack

* **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS.
* **Blockchain Interaction:** Wagmi v2, Viem, RainbowKit.
* **Smart Contracts:** Solidity (v0.8.19).
* **Development Framework:** Foundry (Forge).
* **Storage:** IPFS (via Pinata) for images and off-chain metadata.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js** (v18 or higher) and npm/yarn.
2.  **Foundry** (Forge) installed on your system.
3.  **Git**.
4.  A **Wallet** (MetaMask, Rainbow, etc.) with **Sepolia ETH**.
5.  Accounts on **Alchemy** (for RPC) and **Pinata** (for image uploading).

---

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the repository

git clone [https://github.com/YOUR_USERNAME/REPO_NAME.git](https://github.com/YOUR_USERNAME/REPO_NAME.git)
cd REPO_NAME
2. Smart Contracts Configuration (Backend)
Navigate to the Foundry folder (e.g., foundry/ or root depending on your structure):

Create a .env file in the foundry folder:

Bash

# File: .env
SEPOLIA_RPC_URL=[https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY](https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY)
PRIVATE_KEY=your_private_key_with_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
Load variables and deploy: Run the following command to compile, upload, and verify the contract on Sepolia:

Bash

source .env

forge create src/Crowdfunding.sol:CrowdfundingOptimized \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --broadcast
⚠️ IMPORTANT: Upon completion, the terminal will show Deployed to: 0x.... Copy this address, you will need it for the frontend configuration.

3. Frontend Configuration
Navigate to the client folder (e.g., client/):

Install dependencies:

Bash

npm install
# or
yarn install
Configure Environment Variables (Pinata): Create a .env.local file in the frontend root to enable image uploads to IPFS:

Bash

# File: .env.local
NEXT_PUBLIC_PINATA_JWT=your_long_pinata_jwt_token
NEXT_PUBLIC_GATEWAY_URL=[https://gateway.pinata.cloud](https://gateway.pinata.cloud)
Update the Contract: Go to the configuration file (e.g., src/components/Crowdfunding.tsx or src/config/constants.ts) and update the CONTRACT_ADDRESS variable with the address you obtained in the backend step.

TypeScript

// src/components/Crowdfunding.tsx
export const CONTRACT_ADDRESS = "0xYOUR_NEW_ADDRESS_HERE";
Run the application:

npm run dev
Open http://localhost:3000 in your browser.
