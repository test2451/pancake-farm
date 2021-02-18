const { assert } = require("chai");

const PieToken = artifacts.require('PieToken');

contract('PieToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.pie = await PieToken.new({ from: minter });
    });


    it('mint', async () => {
        await this.pie.mint(alice, 1000, { from: minter });
        assert.equal((await this.pie.balanceOf(alice)).toString(), '1000');
    })
});
