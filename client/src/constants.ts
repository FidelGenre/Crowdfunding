// ⚠️ IMPORTANTE: PEGA AQUÍ LA NUEVA DIRECCIÓN DESPUÉS DEL DEPLOY
export const CONTRACT_ADDRESS = "0x167be4137F6267f19aB865b32843385B70cf2D2e";

export const CONTRACT_ABI = [
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      { "name": "_title", "type": "string" },
      { "name": "_description", "type": "string" },
      { "name": "_image", "type": "string" },
      { "name": "_category", "type": "string" },
      { "name": "_goal", "type": "uint256" },
      { "name": "_durationInDays", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAllCampaigns",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "components": [
          { "name": "owner", "type": "address" },
          { "name": "title", "type": "string" },
          { "name": "description", "type": "string" },
          { "name": "image", "type": "string" },
          { "name": "category", "type": "string" },
          { "name": "goal", "type": "uint256" },
          { "name": "deadline", "type": "uint256" },
          { "name": "amountCollected", "type": "uint256" },
          { "name": "claimed", "type": "bool" }
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
  }
] as const;