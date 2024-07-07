const { toHex } = require("ethereum-cryptography/utils");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "04349be47e9163a285c4e4b076c2605804f1f70627dfd03234f067faa3a4713ffda134d10cfba2b6bd5297d2ce360d00fd882a0b3f0bc7cce5b2becfa8a3318748": 100, //f7328ecd190bb512f313794228b8fbe39cb40dcf9056138e4735176eeb75124a
  "04e0b633c4afd4cefd7eff8e9e2ab7bfd75d97022eb53bec9b25e1cb2d44acadda0fd6c86ca9ef775fa2876eb0b778c4ba93c0a0f24ace57a90f5c2225dc16f11f": 50, //5a4792309557aaa0765c128be0e66ebdfaf1a0473b33fc7dfd1814b2ec5bdd78
  "04ac5c58df90bf5345b8201bf23d245166fccf7cda2e48157b65a24108b12bd30334f0a5149152f6ddc04160b973c2df9afe605d09228e4ae2ff4e9879d37f6cbc": 75, //ca2b102894678d7674783fbfc3b83bfaa3b39f9c5bdf381d97cf059128ecd8b2
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  //TODO: get a signature from the client application
  //Recover the public address from the signature
  const { recoverPublicKey } = await import("@noble/secp256k1");

  const { hashMsg, recipient, amount, signature } = req.body;

  const sign = new Uint8Array(Object.values(signature[0]));
  const hashMsgSerialized = new Uint8Array(Object.values(hashMsg));

  const publicKey = toHex(
    recoverPublicKey(hashMsgSerialized, sign, signature[1])
  );

  setInitialBalance(publicKey);
  setInitialBalance(recipient);

  if (balances[publicKey] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[publicKey] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[publicKey] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
