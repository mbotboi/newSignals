import { ethers } from "ethers";

export const tokensToIgnore = ["USD", "DAI", "ETH"];

const RPC_BASE =
  "https://base-mainnet.g.alchemy.com/v2/6KDOy-eTwEdHPqMLNoYVzyqo2NekmeV0";
const RPC_ZKSYNC =
  "https://thrumming-rough-diamond.zksync-mainnet.quiknode.pro/a72b08e783858050909f8a44eac20a88d5526127/";
const RPC_ETHEREUM =
  "https://eth-mainnet.g.alchemy.com/v2/4Q4F8P8XaU89WLTAMAKw14tHJu_qzOoy";
const RPC_BLAST =
  "https://proportionate-aged-market.blast-mainnet.quiknode.pro/42a18b0ebc19ca8780ac394cedf776b6f4f90f59/";

const RPC_SOLANA =
  "https://solana-mainnet.g.alchemy.com/v2/YYaRBoyCCWsglT9EV7gNHR53WQdYiiY5";

export const CHAIN_IDS: { [key: string]: number } = {
  base: 8453,
  blast: 81457,
  zksync: 324,
  ethereum: 1,
  solana: 1399811149,
  linea: 59144,
  bsc: 56,
  arbitrum: 42161,
  optimism: 10,
};

export const PROVIDERS: { [key: string]: any } = {
  base: new ethers.JsonRpcProvider(RPC_BASE),
  blast: new ethers.JsonRpcProvider(RPC_BLAST),
  zksync: new ethers.JsonRpcProvider(RPC_ZKSYNC),
  ethereum: new ethers.JsonRpcProvider(RPC_ETHEREUM),
  solanaRPC: RPC_SOLANA,
};

export enum REDIS_CHANNELS {
  rvol,
  newToken,
  accumulations,
}
