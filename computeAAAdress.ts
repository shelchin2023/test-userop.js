import { ethers } from "ethers";
import { getAAAddress } from "./utils/getAAAddress"

const nodeRpcUrl = "https://rpc-l2-testnet.fusionist.io/";
const entryPoint = "0xbe7a3f2A0aAB7649f832585Bbe00E73Eba980636";
const kernelFactory = "0x9b0c70D601e40820bED76BB08f7401Dc3a52a59F";
const kernelImpl = "0xA9c87136a4412350DEBC62412971D873c8739Fd3";
const ECDSAValidator = "0x3Cc7F7259e776A3B308189A4e5a83a14eF294CD2";

// EOA Address
const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const provider = new ethers.providers.JsonRpcProvider(nodeRpcUrl);

const aaAddress = await getAAAddress(
    userAddress,
    "0",
    provider,
    entryPoint,
    kernelFactory,
    kernelImpl,
    ECDSAValidator
);

console.log({ aaAddress })