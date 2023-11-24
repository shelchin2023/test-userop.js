import { BigNumberish, BytesLike, ethers } from "ethers";

export interface IUserOperation {
    sender: string;
    nonce: BigNumberish;
    initCode: BytesLike;
    callData: BytesLike;
    callGasLimit: BigNumberish;
    verificationGasLimit: BigNumberish;
    preVerificationGas: BigNumberish;
    maxFeePerGas: BigNumberish;
    maxPriorityFeePerGas: BigNumberish;
    paymasterAndData: BytesLike;
    signature: BytesLike;
}

export const getUserOpHash = (userop: IUserOperation, entryPoint: string, chainId: BigNumberish) => {
    const op = { ...userop };
    const _entryPoint = ethers.utils.getAddress(entryPoint);
    const _chainId = ethers.BigNumber.from(chainId);
    const packed = ethers.utils.defaultAbiCoder.encode(
        [
            "address",
            "uint256",
            "bytes32",
            "bytes32",
            "uint256",
            "uint256",
            "uint256",
            "uint256",
            "uint256",
            "bytes32",
        ],
        [
            op.sender,
            op.nonce,
            ethers.utils.keccak256(op.initCode),
            ethers.utils.keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.preVerificationGas,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            ethers.utils.keccak256(op.paymasterAndData),
        ]
    );

    const enc = ethers.utils.defaultAbiCoder.encode(
        ["bytes32", "address", "uint256"],
        [ethers.utils.keccak256(packed), _entryPoint, _chainId]
    );
    return ethers.utils.keccak256(enc);
}