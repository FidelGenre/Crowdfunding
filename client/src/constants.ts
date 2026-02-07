// ⚠️ IMPORTANTE: PEGA AQUÍ LA NUEVA DIRECCIÓN DESPUÉS DEL DEPLOY
export const CONTRACT_ADDRESS = "0x78B4997086d208aF3905D456D8364f373A04d27C";

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      { "name": "_contentHash", "type": "string" }, 
      { "name": "_goal", "type": "uint256" },
      { "name": "_duration", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCampaigns", 
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "owner", "type": "address" },
          { "name": "goal", "type": "uint256" },
          { "name": "deadline", "type": "uint256" },
          { "name": "amountCollected", "type": "uint256" },
          { "name": "claimed", "type": "bool" },
          { "name": "contentHash", "type": "string" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "donateToCampaign",
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "withdrawFunds",
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "claimRefund",
    "inputs": [{ "name": "_id", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "donations",
    "inputs": [
      { "name": "", "type": "uint256" },
      { "name": "", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;