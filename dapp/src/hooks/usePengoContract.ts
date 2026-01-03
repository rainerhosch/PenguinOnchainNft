'use client'
import { Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import PengoContract from '../constants/PengoContract.json';

export interface PengoContractData {
    // Contract info
    contractAddress: Address | undefined;
    currencySymbol: string | undefined;
    explorerUrl: string | undefined;
    // On-chain data
    maxSupply: bigint | undefined;
    maxMintPerWallet: bigint | undefined;
    mintPrice: bigint | undefined;
    totalSupply: bigint | undefined;
    userBalance: bigint | undefined;
    // Loading states
    isLoading: boolean;
}

export function usePengoContract(): PengoContractData {
    const { address, chain } = useAccount();

    const networkContract = chain?.id !== undefined
        ? PengoContract.networkDeployment.find(network => Number(network.chainId) === chain.id)
        : PengoContract.networkDeployment[0];

    const abi = networkContract?.abi;
    const contractAddress = networkContract?.PengoAddress as Address | undefined;

    // Read MAX_SUPPLY
    const { data: maxSupply, isLoading: isLoadingMaxSupply } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'MAX_SUPPLY',
    });

    // Read MAX_MINT_PER_WALLET
    const { data: maxMintPerWallet, isLoading: isLoadingMaxMint } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'MAX_MINT_PER_WALLET',
    });

    // Read MINT_PRICE
    const { data: mintPrice, isLoading: isLoadingPrice } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'MINT_PRICE',
    });

    // Read totalSupply
    const { data: totalSupply, isLoading: isLoadingTotalSupply } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'totalSupply',
    });

    // Read user balance
    const { data: userBalance, isLoading: isLoadingBalance } = useReadContract({
        address: contractAddress,
        abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    const isLoading = isLoadingMaxSupply || isLoadingMaxMint || isLoadingPrice || isLoadingTotalSupply || isLoadingBalance;

    return {
        contractAddress,
        currencySymbol: networkContract?.currency,
        explorerUrl: networkContract?.explore,
        maxSupply: maxSupply as bigint | undefined,
        maxMintPerWallet: maxMintPerWallet as bigint | undefined,
        mintPrice: mintPrice as bigint | undefined,
        totalSupply: totalSupply as bigint | undefined,
        userBalance: userBalance as bigint | undefined,
        isLoading,
    };
}
