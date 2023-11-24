import { BigNumberish, BytesLike } from "ethers";
import { ethers } from "ethers";
import { UserOperationBuilder, Client, BundlerJsonRpcProvider } from "userop";
import {
    Kernel__factory,
  } from './typechain';
import { getInitCode } from "./utils/gteInitCode";
import { getUserOpHash } from "./utils/getUserOpHash";
import { OpToJSON } from "./utils/OpToJSON";
export interface ICall {
    to: string;
    value: BigNumberish;
    data: BytesLike;
}
enum Operation {
    Call,
    DelegateCall,
  }
const call: ICall = {
    to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    value: "112400000000000000",
    data: "0x"
}

const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const aaAddress = "0x754aBBfab0d330694fd79D3fA3495548a90BA054"
const nodeRpcUrl = "https://rpc-l2-testnet.fusionist.io/";
const entryPoint = "0xbe7a3f2A0aAB7649f832585Bbe00E73Eba980636";


const kernelFactory = "0x9b0c70D601e40820bED76BB08f7401Dc3a52a59F";
const kernelImpl = "0xA9c87136a4412350DEBC62412971D873c8739Fd3";
const ECDSAValidator = "0x3Cc7F7259e776A3B308189A4e5a83a14eF294CD2";
const chainId = "6480001001"
const provider = new ethers.providers.JsonRpcProvider(nodeRpcUrl);

const bundlerUrl = "https://bundler-l2-testnet.fusionist.io"

const salt = "0"
const initCode = getInitCode(userAddress, salt, provider, kernelFactory, kernelImpl, ECDSAValidator)

const kernelFactoryInstance = Kernel__factory.connect(
    kernelFactory,
    provider
  );

const callData  = kernelFactoryInstance.interface.encodeFunctionData("execute", [
       call.to,
      call.value,
      call.data,
      Operation.Call,
  ])

const builder = new UserOperationBuilder().setCallData(callData).setSender(aaAddress).setInitCode(initCode);
const client = await Client.init(nodeRpcUrl, { entryPoint });
const userOp = await client.buildUserOperation(builder)
const userOpHash = getUserOpHash(userOp,entryPoint,chainId)

userOp.signature = "0x27f8fd39ee7a98b175d52e5d3e3437cff1596c22cccb824a677680de96951a9c186e7ca35c64034509d825822ba6edab373221f22c037d1c93ca167631d1880f1b"
console.log({userOp,userOpHash})

try{
    const bundler = new BundlerJsonRpcProvider(nodeRpcUrl ).setBundlerRpc(bundlerUrl);
    await bundler.send("eth_sendUserOperation", [
        OpToJSON(userOp),
       entryPoint
      ]);
}catch(e){
    console.log("eth_sendUserOperation",e)
}
