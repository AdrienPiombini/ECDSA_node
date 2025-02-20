import { useState } from "react";
import server from "./server";
import * as secp from "@noble/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = new TextEncoder().encode(
      `${address}${sendAmount}${recipient}`
    );

    const msgHash = await secp.utils.sha256(message);

    const signature = await secp.sign(msgHash, privateKey, { recovered: true });

    const payload = {
      // sender: address,
      hashMsg: msgHash,
      amount: parseInt(sendAmount),
      recipient,
      signature,
    };

    console.log(
      toHex(secp.recoverPublicKey(msgHash, signature[0], signature[1]))
    );

    try {
      const {
        data: { balance },
      } = await server.post(`send`, payload);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
