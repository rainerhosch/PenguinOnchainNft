const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PengoFactory", function () {
    let pengoNft, pengoFactory, owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        console.log("Signers fetched");
    
    
        const PengoFactory = await ethers.getContractFactory("PengoFactory");
        console.log("PengoFactory contract fetched");
    
        pengoFactory = await PengoFactory.deploy(); 
        await pengoFactory.waitForDeployment();
        console.log("PengoFactory deployed at:", await pengoFactory.getAddress());
        console.log("===========================================================\n");
        
        const PenguinOnchain = await ethers.getContractFactory("PenguinOnchain");
        console.log("PenguinOnchain contract fetched");
    
        pengoNft = await PenguinOnchain.deploy(); 
        await pengoNft.waitForDeployment();
        console.log("pengoNft deployed at:", await pengoNft.getAddress());


    });
    

    it("should return tokenURI correctly", async function () {
        await pengoFactory.setPengoContract(await pengoNft.getAddress());
        console.log("setingup pengo nft to, factory:", await pengoNft.getAddress());
        console.log("===========================================================\n");
        await pengoNft.setFactory(await pengoFactory.getAddress());
        console.log("setingup pengo nft to, factory:", await pengoFactory.getAddress());
        console.log("===========================================================\n");
        // await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const top_wear ='0d0b01010000000e0b01010000000f0b0101000000100b0101000000110b0101000000120b01010000000d0a01010000000e0901010000000f0901010000001009010100000011090101000000120a01010000000d0d01010000000d0c01010000000d09010100000012090101000000100a01010000000f0a01010000000e0801010000000e0701010000000f070101000000100701010000001107010100000011080101000000120c0101000000120d01010000000e0a0101000000110a01010000000f080101000000100801010000000c0d0101000000130d01010000000c0c01010000000c0b01010000000c0a01010000000c0901010000000d0801010000000c0801010000000c0701010000000d07010100000012070101000000130701010000001308010100000013090101000000130a0101000000130b0101000000130c01010000000e0c01010000000f0c0101000000100c0101000000110c010100000012080101000000'
        const part1 = "Top Wear"
        const inisiate1 = await pengoFactory.initializeCoordinates(part1, top_wear); //error
        console.log(`Inisiate1 Coordinate  ${part1}:`, inisiate1);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const body_wear ='0c0e01010000000d0e01010000000e0f01010000000f100101000000130e0101000000120e0101000000110f0101000000101001010000000b0f01010000000b1001010000000a1001010000000b1101010000000b120101000000140f01010000001410010100000014110101000000151001010000001412010100000014130101000000131301010000001213010100000011130101000000101301010000000f1301010000000e1301010000000d1301010000000c1301010000000b1301010000000c1401010000000c1501010000000d1501010000000e1501010000000f15010100000010150101000000111501010000001215010100000013150101000000131401010000000c0f01010000000c1001010000000c1101010000000c1201010000000d1001010000000d0f01010000000d1101010000000d1201010000000d1401010000000e1001010000000e1101010000000e1201010000000e1401010000000f1201010000000f1101010000000f14010100000010140101000000111401010000001214010100000012120101000000121101010000001210010100000013100101000000130f010100000013110101000000131201010000001112010100000010120101000000101101010000001111010100000011100101000000120f01010000000a110101000000151101010000000b1401010000000b1501010000001414010100000014150101000000'
        const part2 = "Body Wear"
        const inisiate2 = await pengoFactory.initializeCoordinates(part2, body_wear); //error
        console.log(`Inisiate2 Coordinate  ${part2}:`, inisiate2);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const foot_wear ='0d1601010000000e1601010000000e1701010000000d1701010000000c1701010000001116010100000011170101000000121701010000001216010100000013170101000000'
        const part3 = "Foot Wear"
        const inisiate3 = await pengoFactory.initializeCoordinates(part3, foot_wear); //error
        console.log(`Inisiate3 Coordinate  ${part3}:`, inisiate3);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const eye_wear ='0d0c01010000000d0d01010000000d0e01010000000e0e01010000000f0e0101000000100e0101000000110e0101000000120e0101000000120d0101000000120c0101000000110c0101000000100c01010000000f0c01010000000e0c01010000000c0c0101000000130c01010000000e0d01010000000f0d0101000000100d0101000000110d0101000000'
        const part4 = "Eye Wear"
        const inisiate4 = await pengoFactory.initializeCoordinates(part4, eye_wear); //error
        console.log(`Inisiate4 Coordinate  ${part4}:`, inisiate4);
        console.log("===========================================================\n");

        const mintPrice = ethers.parseEther("2.5")
        const mint_count = 5;
        const mint = await pengoNft.mintPengo(mint_count,  { value: mintPrice });
        console.log("MInt :", mint);
        console.log("===========================================================\n");
        const totalSupply = await pengoNft.totalSupply();
        console.log("Total Supply:", totalSupply.toString());
        console.log("===========================================================\n");
        const accName = "Purple Hat";
        const accByte = "0d0b01010000000e0b01010000000f0b0101000000100b0101000000110b0101000000120b0101000000130b01010000000d0a01010000000e0901010000000f0901010000001009010100000011090101000000120a01010000000e0a01019013FE0f0a01019013FE100a01019013FE110a01019013FE";
        const addAccessory = await pengoNft.addAccessory(0, part1, accName, accByte);
        console.log("Accessories Add:", addAccessory);
        console.log("===========================================================\n");
        
        var tokenId = 0;
        for(i=0; i < mint_count; i++){
            const accesory = await pengoNft.getNFTDetails(tokenId);
            console.log(`Accesory ${tokenId}:, ${accesory}`);
            console.log("===========================================================\n");
            
            const ownerNft = await pengoNft.ownerOf(tokenId);
            console.log(`Owner of token ${tokenId}:, ${ownerNft}`);
            console.log("===========================================================\n");
            const seedNft = await pengoNft.getSeed(tokenId);
            console.log(`Seed of token ${tokenId}:, ${seedNft}`);
            console.log("===========================================================\n");
            console.log(`mod supply ${tokenId}:, ${BigInt(20000)}`);
            console.log(`Seed mod supply ${tokenId}:, ${seedNft % BigInt(20000)}`);
            console.log("===========================================================\n");
            await new Promise(resolve => setTimeout(resolve, 5000)); // Tunggu 5 detik

            console.time("tokenURI execution time"); // Mulai hitung waktu
            const nft = await pengoFactory.tokenURI(tokenId, seedNft);
            console.timeEnd("tokenURI execution time"); // Akhiri hitung waktu
            console.log("Token URI:", nft);
            console.log("===========================================================\n");
            expect(nft).to.be.a("string");
            
            tokenId +=1;
        }
    });
});
