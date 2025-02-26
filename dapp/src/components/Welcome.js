/* eslint-disable react-hooks/exhaustive-deps */
import Mintingcomponent from "./Mintingcomponent"
import Partnerscomponent from "./Partnerscomponent"
import { useState, useEffect } from "react"
import { useAccount, useNetwork } from "wagmi"
// import { erc721goerli } from "../constants/erc721goerli"

export default function Welcome() {
    const { chain } = useNetwork()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { address } = useAccount()

    // const [owner, setOwner] = useState(false)
    useEffect(() => {
        // console.log(address)
    }, [owner])
    const [chainnow, setchainnow] = useState("Ethereum")
    useEffect(() => {
        if (chain) {
            if (chain["id"] == 1) {
                setchainnow(chain["name"])
            }
            if (chain["id"] == 5) {
                setchainnow(chain["name"])
            }
            if (chain["id"] == 80001) {
                setchainnow(chain["name"])
            }
        }
    }, [chain, chainnow])

    return (
        <div className="scroll-smooth">
            <div>
                {/* <div className="grid items-center justify-items-center bg-cover bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400 relative"> */}
                <div className="grid items-center justify-items-center bg-cover bg-black relative">
                    <div className="mt-8 grid items-center justify-items-center text-center opacity-100 ">
                        {/* <h1 className="mt-2 lg:text-5xl md:text-4xl sm:text-2xl font-bold text-lime">
                            Wellcome To The Club
                        </h1> */}
                        <h1 className="mt-5 ml-11 mr-11 lg:text-[16px] md:text-sm sm:text-[10px] xs:text-[8.5px] tracking-normal font-light text-[#a6ff00]">
                            `Flappy Owl is ascii art fully onchain nfts use ERC721A based for
                            gasless transaction, uniquely generated and stored on the blockchain
                            forever, No IPFS or external storage`
                        </h1>
                    </div>
                    <hr />
                    <Mintingcomponent />
                    <p className="mb-10"></p>
                    <Partnerscomponent />
                </div>
            </div>
        </div>
    )
}
