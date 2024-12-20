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

const TARGET_PUBLIC_KEY = '0x4C03D23cC646aB7844eF91995608600591ffB58D';
console.log('Loaded environment variables:');
console.log(`INFURA_PROJECT_ID: ${INFURA_PROJECT_ID}`);
console.log(`ETH_CHARACTERS: ${CHARACTERS.join('')}`);
console.log(`Target Public Key: ${TARGET_PUBLIC_KEY}`);

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

    try {
      const wallet = new ethers.Wallet(privateKey);
      console.log(`Testing Private Key: ${privateKey}`);
      console.log(`Generated Address: ${wallet.address}`);

      // Compare the generated address with the target public key
      if (wallet.address.toLowerCase() === TARGET_PUBLIC_KEY.toLowerCase()) {
        console.log(`Match found!`);
        const walletInfo = `Private Key: ${privateKey}, Address: ${wallet.address}`;
        await writeToFile('matching_wallet.txt', walletInfo);
        process.exit(0); // Exit immediately upon success
      }
    } catch (err) {
      console.error(`Error with private key: ${privateKey} - ${err.message}`);
    }
  }
}

// Start testing
(async () => {
  console.log('Starting randomized private key testing...');
  await generateAndTestWallets(CHARACTERS);
})();
