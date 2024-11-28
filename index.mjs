import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

// Load environment variables
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
if (!INFURA_PROJECT_ID) {
  console.error('INFURA_PROJECT_ID is not set in the .env file');
  process.exit(1);
}

const CHARACTERS = process.env.ETH_CHARACTERS?.replace(/,/g, '').split('') || [];
if (CHARACTERS.length !== 64) {
  console.error('ETH_CHARACTERS must contain exactly 64 characters.');
  process.exit(1);
}

console.log('Loaded environment variables:');
console.log(`INFURA_PROJECT_ID: ${INFURA_PROJECT_ID}`);
console.log(`ETH_CHARACTERS: ${CHARACTERS.join('')}`);

// Initialize Ethereum provider
const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
console.log('Ethereum provider initialized.');

// Function to write the wallet info to a file
async function writeToFile(filename, data) {
  try {
    await fs.appendFile(filename, data + '\n', 'utf8');
    console.log(`Saved to file: ${filename}`);
  } catch (err) {
    console.error(`Error writing to file: ${err.message}`);
  }
}

// Function to check the balance of a wallet
async function checkBalance(privateKey) {
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);

    // Log the address and balance
    const formattedBalance = ethers.formatEther(balance);
    console.log(`Address: ${wallet.address}, Balance: ${formattedBalance} ETH`);

    // If balance is greater than 0, write it to a file
    if (balance > 0n) {
      const walletInfo = `Private Key: ${privateKey}, Address: ${wallet.address}, Balance: ${formattedBalance} ETH`;
      await writeToFile('wallets_with_balance.txt', walletInfo);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Error with private key: ${privateKey} - ${err.message}`);
    return false;
  }
}

// Function to shuffle the array randomly
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Function to generate and test wallets indefinitely
async function generateAndTestWallets(chars) {
  while (true) {
    const shuffled = shuffleArray([...chars]); // Shuffle characters randomly
    const privateKey = '0x' + shuffled.join('');

    // Validate private key length and format
    if (privateKey.length !== 66 || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      console.log(`Invalid private key format: ${privateKey}`);
      continue;
    }

    console.log(`Testing private key: ${privateKey}`);
    const hasBalance = await checkBalance(privateKey);

    if (hasBalance) {
      console.log(`Success! Private Key: ${privateKey}`);
      process.exit(0); // Exit immediately upon success
    }
  }
}

// Start testing
(async () => {
  console.log('Starting randomized private key testing...');
  await generateAndTestWallets(CHARACTERS);
})();
