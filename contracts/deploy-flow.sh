#!/bin/bash

# Flow EVM Testnet Deployment Script for ResearchGraph AI

echo "🌊 Flow EVM Testnet Deployment Script"
echo "======================================"

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "⚠️  PRIVATE_KEY environment variable is not set!"
    echo "Please set your private key using:"
    echo "export PRIVATE_KEY=your_private_key_here"
    echo ""
    echo "⚠️  WARNING: Make sure your wallet has Flow testnet tokens!"
    echo "Get Flow testnet tokens from: https://testnet-faucet.onflow.org/"
    exit 1
fi

echo "🔧 Network: Flow EVM Testnet"
echo "🌐 RPC URL: https://testnet.evm.nodes.onflow.org"
echo "🔗 Chain ID: 545"
echo ""

# Compile contracts
echo "📦 Compiling contracts..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo "✅ Compilation successful!"
echo ""

# Deploy to Flow EVM testnet
echo "🚀 Deploying contracts to Flow EVM testnet..."
npm run deploy:flow

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "📁 Check deployments.json for contract addresses"
echo ""
echo "🔍 Next steps:"
echo "1. Update your frontend configuration with the new contract addresses"
echo "2. Fund the DAO with initial tokens if needed"
echo "3. Test the contracts on Flow EVM testnet"
echo "4. Update documentation with deployment information" 