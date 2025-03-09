import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys GoldToken and GoldLedger contracts using the deployer account.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // First, deploy the GoldToken contract
  const goldToken = await deploy("GoldToken", {
    from: deployer,
    args: [], // GoldToken doesn't need constructor arguments
    log: true,
    autoMine: true,
  });

  console.log("🪙 GoldToken deployed:", goldToken.address);

  // Then, deploy the GoldLedger contract with the GoldToken address as a constructor argument
  const goldLedger = await deploy("GoldLedger", {
    from: deployer,
    args: [goldToken.address], // Pass GoldToken address to constructor
    log: true,
    autoMine: true,
  });

  console.log("🚀 GoldLedger deployed:", goldLedger.address);

  // Set GoldLedger address in GoldToken contract
  const tokenContract = await ethers.getContractAt("GoldToken", goldToken.address);
  // Cast to any to bypass TypeScript checking since we're working with new methods
  await (tokenContract as any).setGoldLedgerContract(goldLedger.address);
  console.log("🔗 GoldLedger authorized to mint tokens");
};

export default deployContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags GoldLedger
deployContracts.tags = ["GoldToken", "GoldLedger"];
