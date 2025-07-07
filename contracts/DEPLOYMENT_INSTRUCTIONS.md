# Flow EVM Testnet Deployment Instructions

## 🌊 Deploy ResearchGraph AI Contracts to Flow EVM Testnet

### Prerequisites

1. **Node.js**: Make sure you have Node.js installed (v16+ recommended)
2. **Flow Testnet Tokens**: Get Flow testnet tokens from [Flow Testnet Faucet](https://testnet-faucet.onflow.org/)
3. **Private Key**: Have your wallet private key ready (the one with Flow testnet tokens)

### Network Configuration

- **Network**: Flow EVM Testnet
- **RPC URL**: `https://testnet.evm.nodes.onflow.org`
- **Chain ID**: 545
- **Currency**: FLOW

### Deployment Steps

#### 1. Set up environment variables

**Option A: Export environment variable**
```bash
export PRIVATE_KEY=your_private_key_here
```

**Option B: Create .env file**
Create a `.env` file in the contracts directory:
```
PRIVATE_KEY=your_private_key_here
```

⚠️ **Important**: 
- Use the private key WITHOUT the "0x" prefix
- Never commit your .env file to version control
- Make sure your wallet has Flow testnet tokens

#### 2. Compile contracts
```bash
npm run compile
```

#### 3. Deploy to Flow EVM Testnet
```bash
npm run deploy:flow
```

Or use the deployment script:
```bash
./deploy-flow.sh
```

### Expected Output

The deployment will create:
1. **ResearchIPNFT**: Smart contract for research IP tokenization
2. **ResearchDAOSimple**: Simplified DAO for research funding and governance

### Contract Addresses

After deployment, contract addresses will be saved to `deployments.json`:
```json
{
  "network": "flowEVMTestnet",
  "chainId": "545",
  "contracts": {
    "ResearchIPNFT": {
      "address": "0x..."
    },
    "ResearchDAOSimple": {
      "address": "0x..."
    }
  }
}
```

### Verification

To verify your deployment:
1. Check the `deployments.json` file for contract addresses
2. Visit [Flow EVM Testnet Explorer](https://evm-testnet.flowscan.org/) to view your contracts
3. Test basic functionality using the deployed addresses

### Next Steps

1. Update your frontend configuration with the new contract addresses
2. Test the contracts on Flow EVM testnet
3. Fund the DAO with initial tokens if needed
4. Set up governance proposals

### Troubleshooting

**Common Issues:**
- `Insufficient funds`: Make sure your wallet has Flow testnet tokens
- `Invalid private key`: Ensure private key is correct and without "0x" prefix
- `Network unreachable`: Check your internet connection and RPC URL

**Getting Help:**
- Check the [Flow EVM Documentation](https://developers.flow.com/evm/about)
- Join the [Flow Discord](https://discord.gg/flow) for support
- Review the [Hardhat Documentation](https://hardhat.org/docs) for deployment issues

### Security Notes

- Never share your private key
- Use a dedicated wallet for testnet deployments
- Keep your private key secure and never commit it to version control
- Consider using hardware wallets for mainnet deployments 