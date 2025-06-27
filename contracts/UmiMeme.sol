// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract UmiMeme is ERC721, ERC721URIStorage, Ownable {
    // Counters
    uint256 private _tokenIdCounter;
    uint256 private _contestIdCounter;

    // Constants
    uint256 public constant SUBMISSION_FEE = 0.00001 ether;
    uint256 public constant CONTEST_DURATION = 1 weeks;
    uint256 public constant MIN_STAKE_AMOUNT = 0.01 ether;

    // Structs
    struct Meme {
        uint256 tokenId;
        address creator;
        string ipfsCid;
        uint256 contestId;
        uint256 totalStake;
        bool isWinner;
        uint256 timestamp;
    }

    struct Contest {
        uint256 contestId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalStake;
        uint256 winningMemeId;
        bool isFinalized;
    }

    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }

    // Mappings
    mapping(uint256 => Meme) public memes;
    mapping(uint256 => Contest) public contests;
    mapping(uint256 => mapping(address => Stake)) public memeStakes;
    mapping(address => uint256[]) public userCreatedMemes;
    mapping(address => uint256[]) public userStakedMemes;
    mapping(address => uint256[]) public userWinningMemes;

    // Events
    event MemeSubmitted(uint256 indexed tokenId, address indexed creator, string ipfsCid, uint256 contestId);
    event MemeStaked(uint256 indexed tokenId, address indexed staker, uint256 amount);
    event ContestStarted(uint256 indexed contestId, uint256 startTime, uint256 endTime);
    event ContestFinalized(uint256 indexed contestId, uint256 winningMemeId, uint256 totalStake);
    event RewardsDistributed(uint256 indexed contestId, uint256 winningMemeId, uint256 totalRewards);

    constructor() ERC721("UmiMeme", "UMEME") Ownable(msg.sender) {
        // Start first contest
        _startNewContest();
    }

    // Submit a new meme
    function submitMeme(string memory ipfsCid) external payable {
        require(msg.value >= SUBMISSION_FEE, "Insufficient submission fee");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");

        uint256 currentContestId = _contestIdCounter;
        require(!contests[currentContestId].isFinalized, "Current contest is finalized");

        // Mint new token
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, ipfsCid);

        // Create meme
        memes[tokenId] = Meme({
            tokenId: tokenId,
            creator: msg.sender,
            ipfsCid: ipfsCid,
            contestId: currentContestId,
            totalStake: 0,
            isWinner: false,
            timestamp: block.timestamp
        });

        // Update user's created memes
        userCreatedMemes[msg.sender].push(tokenId);

        emit MemeSubmitted(tokenId, msg.sender, ipfsCid, currentContestId);
    }

    // Stake on a meme
    function stakeMeme(uint256 tokenId) external payable {
        require(msg.value >= MIN_STAKE_AMOUNT, "Insufficient stake amount");
        require(tokenId < _tokenIdCounter, "Meme does not exist");
        
        Meme storage meme = memes[tokenId];
        uint256 currentContestId = _contestIdCounter;
        
        require(meme.contestId == currentContestId, "Meme not in current contest");
        require(!contests[currentContestId].isFinalized, "Contest is finalized");
        require(memeStakes[tokenId][msg.sender].amount == 0, "Already staked on this meme");

        // Update stake info
        memeStakes[tokenId][msg.sender] = Stake({
            amount: msg.value,
            timestamp: block.timestamp
        });

        // Update totals
        meme.totalStake += msg.value;
        contests[currentContestId].totalStake += msg.value;

        // Update user's staked memes
        userStakedMemes[msg.sender].push(tokenId);

        emit MemeStaked(tokenId, msg.sender, msg.value);
    }

    // Finalize current contest and distribute rewards
    function finalizeContest() external onlyOwner {
        uint256 currentContestId = _contestIdCounter;
        Contest storage contest = contests[currentContestId];
        
        require(!contest.isFinalized, "Contest already finalized");
        require(block.timestamp >= contest.endTime, "Contest still ongoing");

        // Find winning meme (highest total stake)
        uint256 highestStake = 0;
        uint256 winningMemeId = 0;
        uint256 currentTokenId = _tokenIdCounter;

        for (uint256 i = 0; i < currentTokenId; i++) {
            if (memes[i].contestId == currentContestId && memes[i].totalStake > highestStake) {
                highestStake = memes[i].totalStake;
                winningMemeId = i;
            }
        }

        require(winningMemeId > 0, "No memes in contest");

        // Update contest and meme info
        contest.isFinalized = true;
        contest.winningMemeId = winningMemeId;
        memes[winningMemeId].isWinner = true;

        // Add to creator's winning memes
        userWinningMemes[memes[winningMemeId].creator].push(winningMemeId);

        // Distribute rewards to winning stakers
        uint256 totalRewards = contest.totalStake;
        uint256 winningMemeStake = memes[winningMemeId].totalStake;

        emit ContestFinalized(currentContestId, winningMemeId, totalRewards);

        // Start new contest
        _startNewContest();

        // Distribute rewards
        _distributeRewards(currentContestId, winningMemeId, totalRewards, winningMemeStake);
    }

    // Internal function to distribute rewards
    function _distributeRewards(
        uint256 contestId,
        uint256 winningMemeId,
        uint256 totalRewards,
        uint256 winningMemeStake
    ) internal {
        uint256 currentTokenId = _tokenIdCounter;
        for (uint256 i = 0; i < currentTokenId; i++) {
            address staker = ownerOf(i);
            Stake memory stakerInfo = memeStakes[winningMemeId][staker];
            
            if (stakerInfo.amount > 0) {
                uint256 reward = (stakerInfo.amount * totalRewards) / winningMemeStake;
                (bool success, ) = payable(staker).call{value: reward}("");
                require(success, "Failed to send reward");
            }
        }

        emit RewardsDistributed(contestId, winningMemeId, totalRewards);
    }

    // Internal function to start a new contest
    function _startNewContest() internal {
        uint256 newContestId = _contestIdCounter;
        _contestIdCounter += 1;

        contests[newContestId] = Contest({
            contestId: newContestId,
            startTime: block.timestamp,
            endTime: block.timestamp + CONTEST_DURATION,
            totalStake: 0,
            winningMemeId: 0,
            isFinalized: false
        });

        emit ContestStarted(newContestId, block.timestamp, block.timestamp + CONTEST_DURATION);
    }

    // View functions
    function getCurrentContest() external view returns (Contest memory) {
        return contests[_contestIdCounter];
    }

    function getMemesByContest(uint256 contestId) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256 currentTokenId = _tokenIdCounter;
        
        // First count memes in this contest
        for (uint256 i = 0; i < currentTokenId; i++) {
            if (memes[i].contestId == contestId) {
                count++;
            }
        }

        // Then create and fill array
        uint256[] memory contestMemes = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < currentTokenId; i++) {
            if (memes[i].contestId == contestId) {
                contestMemes[index] = i;
                index++;
            }
        }

        return contestMemes;
    }

    function getUserProfile(address user) external view returns (
        uint256[] memory created,
        uint256[] memory staked,
        uint256[] memory won
    ) {
        return (
            userCreatedMemes[user],
            userStakedMemes[user],
            userWinningMemes[user]
        );
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Receive function to accept ETH
    receive() external payable {}
} 