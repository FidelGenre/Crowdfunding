import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi'; 
import {
  sepolia,
  foundry,
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: '615c738eee7275e286995192ff2c3345',
  chains: [
    sepolia, 
    foundry,
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
  ],
  ssr: true,
  
  transports: {
    [sepolia.id]: http(), 
    [foundry.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});