const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Faucet', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');
    const faucet = await Faucet.deploy();

    const [owner, signer2] = await ethers.getSigners();

    let withdrawAmount = ethers.utils.parseUnits("1", "ether");

    return { faucet, owner, signer2, withdrawAmount };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals above .1 ETH each time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it('should only be called by the contract owner', async function () {
    const { faucet, withdrawAmount, signer2 } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.connect(signer2).withdraw(withdrawAmount)).to.be.reverted;
  });

  it('should selfdestruct when destroyFaucet() is called', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);
    await faucet.connect(owner).destroyFaucet();
    expect(await owner.provider.getCode(faucet.address)).to.equal("0x");
  });
});