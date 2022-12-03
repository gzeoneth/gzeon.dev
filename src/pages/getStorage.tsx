import * as React from "react"
import "../style.css";

import { WagmiConfig, createClient, chain, useProvider, useNetwork, Chain, configureChains } from "wagmi";
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";

// import { alchemyProvider } from 'wagmi/providers/alchemy'
// import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

// import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { InjectedConnector } from "wagmi/connectors/injected";
import { MockConnector } from "wagmi/connectors/mock";
import { ethers, VoidSigner } from "ethers";

const arbNovaChain: Chain = {
    id: 42170,
    name: 'Arbitrum Nova',
    network: 'arbnova',
    nativeCurrency: {
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: 'https://nova.arbitrum.io/rpc',
        default: 'https://nova.arbitrum.io/rpc',
    },
    blockExplorers: {
        default: { name: 'Nova Arbiscan', url: 'https://nova.arbiscan.io' },
    },
    testnet: false,
}

const { chains, provider } = configureChains(
    [chain.mainnet, chain.arbitrum, arbNovaChain, chain.goerli, chain.arbitrumGoerli],
    [
        jsonRpcProvider({
            rpc: (chain) => {
                return { http: chain.rpcUrls.default }
            },
        }),
    ],
)

const client = createClient(
    getDefaultClient({
        appName: "gzeon",
        connectors: [
            // new MetaMaskConnector({ chains: [chain.mainnet, chain.arbitrum, chain.goerli, chain.arbitrumGoerli] }),
            // new InjectedConnector({ chains: [chain.mainnet, chain.arbitrum, chain.goerli, chain.arbitrumGoerli] }),
            new MockConnector({ chains: chains, options: { signer: new VoidSigner(ethers.constants.AddressZero) } }),
        ],
        provider: provider
    }),
);

// styles
const pageStyles = {
    color: "#232129",
    padding: 96,
    fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
    marginTop: 0,
    marginBottom: 64,
    maxWidth: 320,
}
const headingAccentStyles = {
    color: "#663399",
}
const resultStyles = {
    fontFamily: "Menlo, monospace",
}

const PROXY_ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103'
const PROXY_IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
const SECONDARY_IMPL_SLOT = '0x2b1dbce74324248c222f0ec2d5ed7bd323cfc425b336f0253c5ccfda7265546d'

// markup
const GetStorageTool = () => {
    const [addr, setAddr] = React.useState<string>("");
    const [slot, setSlot] = React.useState<string>("");
    const [cachedchain, setCachedChain] = React.useState<Chain>();
    const [result, setResult] = React.useState<string>("");
    const provider = useProvider()
    const network = useNetwork()
    const handleSubmit = async (event: any) => {
        event.preventDefault();
        try {
            setResult("")
            setCachedChain(network.chain)
            if (!ethers.utils.isAddress(addr)) {
                setResult("Invalid address")
                return
            }
            if (!ethers.utils.isHexString(slot)) {
                setResult("Invalid slot")
                return
            }
            const isContract = (await provider.getCode(addr)).length > 2; // 0x
            if (isContract) {
                const res = await provider.getStorageAt(addr, slot)
                if (slot === PROXY_ADMIN_SLOT || slot === PROXY_IMPL_SLOT || slot === SECONDARY_IMPL_SLOT) {
                    setResult(`0x${res.slice(26)}`)
                } else {
                    setResult(res)
                }
            } else {
                setResult("Not a contract")
            }
        } catch (e) {
            setResult((e as any).message)
        }
    };
    const handleAddrChange = (event: any) => {
        setAddr((event.target.value as string).trim());
    };
    const handleSlotChange = (event: any) => {
        setSlot((event.target.value as string).trim());
    };
    return (
        <main style={pageStyles}>
            <WagmiConfig client={client}>
                <ConnectKitProvider theme="soft">
                    <title>gzeon.dev</title>
                    <h1 style={headingStyles}>
                        Welcome
                        <br />
                        <a href="/"><span style={headingAccentStyles}>to gzeon.dev</span></a>
                    </h1>
                    <ConnectKitButton showAvatar={false} />
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-container">
                                <input
                                    autoFocus
                                    placeholder="Contract Address"
                                    value={addr}
                                    onChange={handleAddrChange}
                                    className="input-style"
                                />
                                <input
                                    autoFocus
                                    placeholder="Storage Slot"
                                    value={slot}
                                    onChange={handleSlotChange}
                                    className="input-style"
                                />
                                <input type="submit" value="Submit" />
                            </div>
                            <div>
                                <br></br>
                                <label>
                                    <input
                                        type="radio"
                                        name="slot_type"
                                        value={PROXY_ADMIN_SLOT}
                                        checked={slot === PROXY_ADMIN_SLOT}
                                        onChange={handleSlotChange}
                                    /> proxy-admin
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="slot_type"
                                        value={PROXY_IMPL_SLOT}
                                        checked={slot === PROXY_IMPL_SLOT}
                                        onChange={handleSlotChange}
                                    /> proxy-impl
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="slot_type"
                                        value={SECONDARY_IMPL_SLOT}
                                        checked={slot === SECONDARY_IMPL_SLOT}
                                        onChange={handleSlotChange}
                                    /> 2nd-proxy-impl
                                </label>
                            </div>
                        </form>
                        <h6>
                            Paste your Address and Storage slot to get the value
                        </h6>
                    </div>
                    <div style={resultStyles}>
                        <p>
                            Result on {cachedchain?.name}:&nbsp;&nbsp; {result.length == 42 && cachedchain && cachedchain.blockExplorers ? <a href={`
                            ${cachedchain?.blockExplorers?.default.url}/address/${result}
                            `} target="_blank">{result}</a> : result}
                        </p>
                    </div>
                </ConnectKitProvider>
            </WagmiConfig>
        </main>
    )
}

export default GetStorageTool
