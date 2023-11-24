import { ethers } from "ethers";
import {
  EntryPoint__factory,
} from '../typechain';

import { getInitCode } from "./gteInitCode";

export async function getAAAddress(
  userAddress: string,
  salt: string,
  provider: ethers.providers.JsonRpcProvider,
  entryPoint: string,
  kernelFactory: string,
  kernelImpl: string,
  ECDSAValidator: string,
): Promise<string> {
  try {
    const entryPointInstance = EntryPoint__factory.connect(
      entryPoint,
      provider
    );
    const initCode = getInitCode(userAddress, salt, provider, kernelFactory, kernelImpl, ECDSAValidator)
    await entryPointInstance.callStatic.getSenderAddress(initCode);
  } catch (error: any) {
    const aaAddress = error?.errorArgs?.sender;
    return aaAddress;
  }
  return "0x";
}