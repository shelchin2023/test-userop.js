import { ethers } from "ethers";
import {
    KernelFactory__factory,
    Kernel__factory,
} from '../typechain';

export const getInitCode = (
    userAddress: string,
    salt: string,
    provider: ethers.providers.JsonRpcProvider,
    kernelFactory: string,
    kernelImpl: string,
    ECDSAValidator: string,) => {
    const kernelFactoryInstance = KernelFactory__factory.connect(
        kernelFactory,
        provider
    );
    const kernelProxyInstance = Kernel__factory.connect(kernelImpl, provider);
    return ethers.utils.hexConcat([
        kernelFactory,
        kernelFactoryInstance.interface.encodeFunctionData("createAccount", [
            kernelImpl,
            kernelProxyInstance.interface.encodeFunctionData("initialize", [
                ECDSAValidator,
                userAddress,
            ]),
            ethers.BigNumber.from(salt),
        ]),
    ]);
}