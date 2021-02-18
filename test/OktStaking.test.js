const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const PIeToken = artifacts.require('PieToken');
const OKTStaking = artifacts.require('OKtStaking');
const MockOIP20 = artifacts.require('libs/MockOIP20');
const WOKT = artifacts.require('libs/WOKT');

contract('OktStaking.......', async ([alice, bob, admin, dev, minter]) => {
  beforeEach(async () => {
    this.rewardToken = await PieToken.new({ from: minter });
    this.lpToken = await MockBEP20.new('LPToken', 'LP1', '1000000', {
      from: minter,
    });
    this.wOKT = await WOKT.new({ from: minter });
    this.oktChef = await OktStaking.new(
      this.wOKT.address,
      this.rewardToken.address,
      1000,
      10,
      1010,
      admin,
      this.wOKT.address,
      { from: minter }
    );
    await this.rewardToken.mint(this.bnbChef.address, 100000, { from: minter });
  });

  it('deposit/withdraw', async () => {
    await time.advanceBlockTo('10');
    await this.oktChef.deposit({ from: alice, value: 100 });
    await this.oktChef.deposit({ from: bob, value: 200 });
    assert.equal(
      (await this.wOKT.balanceOf(this.oktChef.address)).toString(),
      '300'
    );
    assert.equal((await this.oktChef.pendingReward(alice)).toString(), '1000');
    await this.oktChef.deposit({ from: alice, value: 300 });
    assert.equal((await this.bnbChef.pendingReward(alice)).toString(), '0');
    assert.equal((await this.rewardToken.balanceOf(alice)).toString(), '1333');
    await this.oktChef.withdraw('100', { from: alice });
    assert.equal(
      (await this.wOKT.balanceOf(this.oktChef.address)).toString(),
      '500'
    );
    await this.oktChef.emergencyRewardWithdraw(1000, { from: minter });
    assert.equal((await this.oktChef.pendingReward(bob)).toString(), '1399');
  });

  it('should block man who in blanklist', async () => {
    await this.oktChef.setBlackList(alice, { from: admin });
    await expectRevert(
      this.oktChef.deposit({ from: alice, value: 100 }),
      'in black list'
    );
    await this.oktChef.removeBlackList(alice, { from: admin });
    await this.oktChef.deposit({ from: alice, value: 100 });
    await this.oktChef.setAdmin(dev, { from: minter });
    await expectRevert(
      this.oktChef.setBlackList(alice, { from: admin }),
      'admin: wut?'
    );
  });

  it('emergencyWithdraw', async () => {
    await this.oktChef.deposit({ from: alice, value: 100 });
    await this.oktChef.deposit({ from: bob, value: 200 });
    assert.equal(
      (await this.wOKT.balanceOf(this.oktChef.address)).toString(),
      '300'
    );
    await this.oktChef.emergencyWithdraw({ from: alice });
    assert.equal(
      (await this.wOKT.balanceOf(this.oktChef.address)).toString(),
      '200'
    );
    assert.equal((await this.wOKT.balanceOf(alice)).toString(), '100');
  });

  it('emergencyRewardWithdraw', async () => {
    await expectRevert(
      this.oktChef.emergencyRewardWithdraw(100, { from: alice }),
      'caller is not the owner'
    );
    await this.oktChef.emergencyRewardWithdraw(1000, { from: minter });
    assert.equal((await this.rewardToken.balanceOf(minter)).toString(), '1000');
  });

  it('setLimitAmount', async () => {
    // set limit to 1e-12 OKT
    await this.oktChef.setLimitAmount('1000000', { from: minter });
    await expectRevert(
      this.oktChef.deposit({ from: alice, value: 100000000 }),
      'exceed the to'
    );
  });
});
