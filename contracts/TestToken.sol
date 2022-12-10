// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestToken is ERC721 {
    address owner;

    uint256 public totalMints = 0;
    uint256 public mintPrice = 1 ether;
    uint256 public maxSupply = 50;
    uint256 public maxPerWallet = 10;
    string public URI =
        "https://bafybeifqmgyfy4by3gpms5sdv3ft3knccmjsqxfqquuxemohtwfm7y7nwa.ipfs.dweb.link/metadata.json";

    mapping(address => uint256) public walletMints;

    event NftBought(address _seller, address _buyer, uint256 _price);

    mapping(uint256 => uint256) public tokenIdToPrice;

    constructor() ERC721("MyToken", "MTK") {
        owner = msg.sender;
    }

    function safeMint(address _to, uint256 _quantity) internal {
        for (uint i = 0; i < _quantity; i++) {
            uint256 tokenId = totalMints + 1;
            totalMints++;

            _safeMint(_to, tokenId);
        }
    }

    function mintToken(uint256 _quantity) public payable {
        require(_quantity * mintPrice == msg.value, "wrong amount sent");
        require(
            walletMints[msg.sender] + _quantity <= maxPerWallet,
            "Mints per wallet exceeded"
        );

        walletMints[msg.sender] += _quantity;
        safeMint(msg.sender, _quantity);
    }

    function getMywalletMints() public view returns (uint256) {
        return walletMints[msg.sender];
    }

    function withdraw() public {
        payable(owner).transfer(address(this).balance);
    }

    function getMintFee(uint256 _quantity) public view returns (uint256) {
        return mintPrice * _quantity;
    }

    function allowBuy(uint256 _tokenId, uint256 _price) external {
        require(msg.sender == ownerOf(_tokenId), "Not owner of this token");
        require(_price > 0, "Price zero");
        tokenIdToPrice[_tokenId] = _price;
    }

    function disallowBuy(uint256 _tokenId) external {
        require(msg.sender == ownerOf(_tokenId), "Not owner of this token");
        tokenIdToPrice[_tokenId] = 0;
    }

    function buy(uint256 _tokenId) external payable {
        uint256 price = tokenIdToPrice[_tokenId];
        require(price > 0, "This token is not for sale");
        require(msg.value == price, "Incorrect Value");

        address seller = ownerOf(_tokenId);
        _transfer(seller, msg.sender, _tokenId);
        tokenIdToPrice[_tokenId] = 0;
        payable(seller).transfer(msg.value);

        emit NftBought(seller, msg.sender, msg.value);
    }
}
