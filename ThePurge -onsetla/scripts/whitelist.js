/**
 *  This array contains the addresses of the whitelisted users.
 *  Make sure to add your white-listed users to this array. Otherwise,
 *  they will not be able to interact with the contract and mint on pre-sale process. For the public sale,
 *  the whitelist is not required.
 *
 *  ** IMPORTANT: **
 *  Since we are passing the whitelist root (merkleroot) to the contract constructor when deploying,
 *  if you add a new user address to the whitelist or remove an existing user address from the whitelist,
 *  you must change the merkleroot in the contract. For this reason, I created a new script to update the merkleroot
 *  in the contract. You can find it in `scripts/setMerkleRoot.js`.
 */

module.exports = [
'0xbf3CD0322289c2c71273F2d81FB949Bdd3Ac4471',
'0x831b5baD52C1cf3458C0E41e3b401F735D673a28',
'0x702107ce5709f4F955eB3Ff8aD6ac80D9899aC4B',
'0x393e0e64131AB285E92fEb45F18ace463E8bADe4',
'0xd0Bd63210f1dD8684CC7227aC4f0a3e4328BC368',
'0x65D5703BEbB6348F8e33f0023A61D4D9661D2275',
'0xd0Bd63210f1dD8684CC7227aC4f0a3e4328BC368',
'0x5930d529784c14A480F79c48D962ED6452f1ca21',
'0x2bbB8b53e85C05bcaBD4c2fAd52390b9c37cecd3'
]
