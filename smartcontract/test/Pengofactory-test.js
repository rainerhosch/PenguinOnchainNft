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
        const top_wear ='100701010000000c0701010000000d0701010000000e0701010000000f0701010000001107010100000012070101000000130701010000000c0801010000000c0901010000000c0a01010000000c0b01010000000c0c01010000000c0d01010000000d0d01010000000d0c01010000000d0b01010000000e0b01010000000f0b0101000000100b0101000000110b0101000000120b0101000000120c0101000000120d01010000001308010100000013090101000000130a0101000000130b0101000000130c0101000000130d0101000000120e01010000000d0e01010000000e0e0101000000110e01010000000b0d0101000000140d01010000000d0a01010000000d0901010000000d0801010000000e0801010000000f080101000000100801010000001108010100000012080101000000120a0101000000110a0101000000100a01010000000f0a01010000000e0a01010000000e0901010000000f090101000000100901010000001109010100000012090101000000'
        const part1 = "Top Wear"
        const inisiate1 = await pengoFactory.initializeCoordinates(part1, top_wear); //error
        console.log(`Inisiate1 Coordinate  ${part1}:`, inisiate1);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const body_wear ='0c0e01010000000d0e0101000000120e0101000000130e0101000000140f0101000000151001010000000b0f01010000000a1001010000000e0f01010000000f100101000000110f0101000000101001010000000f0f0101000000100f01010000000a110101000000151101010000000b1201010000000b1301010000000b1401010000000c1501010000000d1501010000000e1501010000000f150101000000101501010000001115010100000012150101000000131501010000001412010100000014130101000000141401010000000c0f01010000000d0f01010000000d1001010000000b1001010000000c1001010000000e1001010000000e1101010000000d1101010000000c1101010000000b1101010000000c1201010000000c1301010000000c1401010000000d1401010000000e1401010000000f14010100000010140101000000111401010000001214010100000013140101000000131301010000001312010100000013110101000000141101010000001410010100000013100101000000130f0101000000120f01010000001210010100000012110101000000121201010000001213010100000011130101000000111201010000001111010100000011100101000000101101010000000f1101010000000e1201010000000d1201010000000f12010100000010120101000000101301010000000f1301010000000e1301010000000d130101000000'
        const part2 = "Body Wear"
        const inisiate2 = await pengoFactory.initializeCoordinates(part2, body_wear); //error
        console.log(`Inisiate2 Coordinate  ${part2}:`, inisiate2);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const foot_wear ='0d1601010000000e1601010000000d1701010000000c1701010000000c1801010000000b1801010000000e1701010000000d1801010000000c1901010000000b1901010000000a1901010000000f170101000000111601010000001117010100000010170101000000121601010000001217010100000013170101000000121801010000001318010100000014180101000000151901010000001419010100000013190101000000'
        const part3 = "Foot Wear"
        const inisiate3 = await pengoFactory.initializeCoordinates(part3, foot_wear); //error
        console.log(`Inisiate3 Coordinate  ${part3}:`, inisiate3);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const eye_wear ='0d0b01010000000e0b01010000000f0b0101000000100b0101000000110b0101000000120b01010000000d0c01010000000d0d01010000000e0d01010000000e0c01010000000f0d0101000000100d0101000000110d0101000000120d0101000000120c0101000000110c0101000000100c01010000000f0c0101000000'
        const part4 = "Eye Wear"
        const inisiate4 = await pengoFactory.initializeCoordinates(part4, eye_wear); //error
        console.log(`Inisiate4 Coordinate  ${part4}:`, inisiate4);
        console.log("===========================================================\n");
        await new Promise(resolve => setTimeout(resolve, 500)); // Tunggu 5 detik
        const gear ='1511010100000016100101000000170f0101000000180e0101000000190d0101000000150f010100000017110101000000160f0101000000171001010000001a0c0101000000170e0101000000180f0101000000180d0101000000190e0101000000190c01010000001a0d0101000000150c0101000000150d0101000000150e0101000000151001010000001512010100000015130101000000151401010000001615010100000015160101000000161601010000001716010100000018160101000000191601010000001a1601010000001a1501010000001a1401010000001a1301010000001a1201010000001a1101010000001a1001010000001a0f01010000001a0e0101000000160c0101000000170c0101000000180c0101000000160d0101000000170d0101000000190f010100000019100101000000191101010000001912010100000019130101000000191401010000001915010100000018150101000000171501010000001515010100000016140101000000161301010000001612010100000016110101000000160e01010000001712010100000017130101000000171401010000001814010100000018130101000000181201010000001811010100000018100101000000090c0101000000090d0101000000090e0101000000090f010100000009100101000000091101010000000912010100000009130101000000091401010000000915010100000009160101000000081601010000000716010100000006160101000000051601010000000a1601010000000a1501010000000a1401010000000a1301010000000a1201010000000a1101010000000a0c01010000000a0d01010000000a0e01010000000a0f01010000000a100101000000051501010000000514010100000005130101000000051201010000000511010100000005100101000000050f0101000000050e0101000000050d0101000000060d0101000000060c0101000000050c0101000000070c0101000000080c0101000000080d0101000000080e0101000000080f0101000000081001010000000811010100000008120101000000081301010000000814010100000008150101000000061501010000000614010100000006130101000000061201010000000611010100000006100101000000060f0101000000060e0101000000070d0101000000070e0101000000070f0101000000071001010000000711010100000007120101000000071301010000000714010100000007150101000000'
        const part5 = "Gear"
        const inisiate5 = await pengoFactory.initializeCoordinates(part5, gear); //error
        console.log(`Inisiate4 Coordinate  ${part5}:`, inisiate5);
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
