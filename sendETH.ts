import { BigNumberish, BytesLike } from "ethers";
import { ethers } from "ethers";
import { UserOperationBuilder, Client, Presets, BundlerJsonRpcProvider, UserOperationMiddlewareCtx } from "userop";

import {
  Kernel__factory,
  EntryPoint__factory
} from './typechain';
import { getInitCode } from "./utils/getInitCode";
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

// 变数
const userAddress = "0xCb881bd0c621b636aD5eca617C2a1989F4BD0901"
const aaAddress = "0x84c6aD48086a1a50e1a510B432caa15e8A988f1C"

const nodeRpcUrl = "https://rpc-l2-testnet.fusionist.io";
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

const callData = kernelFactoryInstance.interface.encodeFunctionData("execute", [
  call.to,
  call.value,
  call.data,
  Operation.Call,
])

const resolveAccount = async (ctx: UserOperationMiddlewareCtx) => {
  const entryPointInstance = EntryPoint__factory.connect(
    ctx.entryPoint,
    provider
  );
  ctx.op.nonce = await entryPointInstance.getNonce(ctx.op.sender, 0);
  ctx.op.initCode = ctx.op.nonce.eq(0) ? ctx.op.initCode : "0x";

};

const bundler = new BundlerJsonRpcProvider(nodeRpcUrl).setBundlerRpc(bundlerUrl);

const builder = new UserOperationBuilder()
  .setSender(aaAddress)
  .setCallData(callData)
  .setInitCode(initCode)

  .setPreVerificationGas(0x1117000)
  .setVerificationGasLimit(0x1117000)
  .setCallGasLimit(0x1117000)

  .useMiddleware(resolveAccount)
  .useMiddleware(Presets.Middleware.getGasPrice(bundler))
// .useMiddleware(Presets.Middleware.estimateUserOperationGas(bundler))


const client = await Client.init(nodeRpcUrl, { entryPoint });
const userOp = await client.buildUserOperation(builder)

const userOpHash = getUserOpHash(userOp, entryPoint, chainId)

console.log({ userOp, userOpHash })

userOp.signature = "0x13b2282d3b9c3df36f763e3637a2f1da3f6d443681573bcefcbd27d52bd0f3d6713d18210f43ef80e8ff4cc01dd868d660e2a41663a9753527683d0475b36e3c1c"
// 必须在 签名签名添加一个 mode ,长度为4个字节，参考  https://docs.zerodev.app/extend-wallets/overview#validation-phase
userOp.signature = userOp.signature.replace("0x", "0x00000000")
console.log({ userOp, userOpHash })
try {
  const bundler = new BundlerJsonRpcProvider(nodeRpcUrl).setBundlerRpc(bundlerUrl);
  await bundler.send("eth_sendUserOperation", [
    OpToJSON(userOp),
    entryPoint
  ]);
} catch (e) {
  console.log("eth_sendUserOperation", e)
}