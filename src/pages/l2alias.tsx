import * as React from "react"
import "../style.css";

import { Address } from '@arbitrum/sdk/dist/lib/dataEntities/address'

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

// markup
const L2AliasTool = () => {
    const [input, setInput] = React.useState<string>("");
    const [address, setAddr] = React.useState<Address>();
    const handleSubmit = (event: any) => {
        event.preventDefault();
        try {
            setAddr(new Address(input));
        } catch (e) {
            console.warn(e)
        }
    };
    const handleChange = (event: any) => {
        setInput(event.target.value);
    };
    return (
        <main style={pageStyles}>
            <title>gzeon.dev</title>
            <h1 style={headingStyles}>
                Welcome
                <br />
                <a href="/"><span style={headingAccentStyles}>to gzeon.dev</span></a>
            </h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <div className="form-container">
                        <input
                            autoFocus
                            placeholder="Tx hash"
                            value={input}
                            onChange={handleChange}
                            className="input-style"
                        />
                        <input type="submit" value="Submit" />
                    </div>
                </form>
                <h6>
                    Paste your Address above to calculate the L2 Alias
                </h6>
            </div>
            <div style={resultStyles}>
                <p> 
                    Address:&nbsp;&nbsp; {address?.value} 
                </p>
                <p> 
                    Aliased:&nbsp;&nbsp; {address?.applyAlias().value} 
                </p>
                <p> 
                    Unaliased: {address?.undoAlias().value} 
                </p>
            </div>
        </main>
    )
}

export default L2AliasTool
