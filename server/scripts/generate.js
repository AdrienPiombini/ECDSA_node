const secp = require("@noble/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privatekey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privatekey);

console.log(toHex(privatekey));
console.log(toHex(publicKey));
