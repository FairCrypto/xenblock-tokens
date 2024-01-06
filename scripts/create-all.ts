import { main as xuni } from "./create-xuni";
import { main as xenium } from "./create-xenium";
import { main as superBlock } from "./create-super-block";
import { main as voteManager } from "./create-vote-manager";
import { main as tokenRegistry } from "./create-token-registry";

require("dotenv").config();

const BLOCK_STORAGE_ADDRESS = process.env.BLOCK_STORAGE_ADDRESS || "";
const SFC_LIB_ADDRESS = process.env.SFC_LIB_ADDRESS || "";
const PERCENTAGE = process.env.PERCENTAGE || "";
const BUFFER_PERCENTAGE = process.env.BUFFER_PERCENTAGE || "20";

console.log("BLOCK_STORAGE_ADDRESS:", BLOCK_STORAGE_ADDRESS);
console.log("SFC_LIB_ADDRESS:", SFC_LIB_ADDRESS);
console.log("PERCENTAGE:", PERCENTAGE);
console.log("BUFFER_PERCENTAGE:", BUFFER_PERCENTAGE);

if (!BLOCK_STORAGE_ADDRESS) {
  throw new Error("BLOCK_STORAGE_ADDRESS is not set");
}

if (!SFC_LIB_ADDRESS) {
  throw new Error("SFC_LIB_ADDRESS is not set");
}

export async function main() {
  const vm = await voteManager(
    BLOCK_STORAGE_ADDRESS,
    SFC_LIB_ADDRESS,
    PERCENTAGE,
    BUFFER_PERCENTAGE,
  );
  const vmAddr = await vm.getAddress();

  const tr = await tokenRegistry();
  const trAddr = await tr.getAddress();

  const xnm = await xenium(vmAddr, trAddr);
  const xu = await xuni(vmAddr, trAddr);
  const sb = await superBlock(vmAddr, trAddr);

  await tr.registerToken(await xnm.getAddress(), false);
  await tr.registerToken(await xu.getAddress(), true);
  await tr.registerToken(await sb.getAddress(), false);

  await vm.updateTokenRegistryAddress(trAddr);

  console.log();
  console.log("Add the following to your .env file for easy upgrades later.");
  console.log(`VOTE_MANAGER_ADDRESS=${vmAddr}`);
  console.log(`TOKEN_REGISTRY_ADDRESS=${trAddr}`);
  console.log(`XENIUM_ADDRESS=${await xnm.getAddress()}`);
  console.log(`XUNI_ADDRESS=${await xu.getAddress()}`);
  console.log(`SUPER_BLOCK_ADDRESS=${await sb.getAddress()}`);
  console.log();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
