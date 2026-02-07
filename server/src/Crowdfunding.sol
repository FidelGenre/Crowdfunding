// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CrowdfundingOptimized {
    
    // Main structure to store campaign data
    struct Campaign {
        address owner;           // Creator of the campaign
        uint256 goal;            // Target amount in Wei
        uint256 deadline;        // Expiration timestamp
        uint256 amountCollected; // Total funds raised
        bool claimed;            // If funds were withdrawn
        string contentHash;      // IPFS CID for title, desc, and image
    }

    // Storage for all campaigns and total count
    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns;
    
    // Tracks donations: Campaign ID => Donor => Amount
    mapping(uint256 => mapping(address => uint256)) public donations;

    // Events for frontend tracking
    event CampaignCreated(uint256 indexed id, address indexed owner, string contentHash, uint256 goal);
    event Donated(uint256 indexed id, address indexed donor, uint256 amount);
    event Refunded(uint256 indexed id, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);

    // Creates a new campaign using calldata for the string to save gas
    function createCampaign(
        string calldata _contentHash, 
        uint256 _goal, 
        uint256 _duration
    ) public {
        require(_goal > 0, "Goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        // Reference the mapping slot directly to save gas
        Campaign storage newCampaign = campaigns[numberOfCampaigns];
        
        newCampaign.owner = msg.sender;
        newCampaign.contentHash = _contentHash;
        newCampaign.goal = _goal;
        newCampaign.deadline = block.timestamp + _duration;
        newCampaign.amountCollected = 0;
        newCampaign.claimed = false;

        emit CampaignCreated(numberOfCampaigns, msg.sender, _contentHash, _goal);

        // Increments counter without overflow checks to save gas
        unchecked {
            numberOfCampaigns++;
        }
    }

    // Handles ETH donations to active campaigns
    function donateToCampaign(uint256 _id) public payable {
        require(msg.value > 0, "Must send ETH");

        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign ended");

        campaign.amountCollected += msg.value;
        donations[_id][msg.sender] += msg.value;

        emit Donated(_id, msg.sender, msg.value);
    }

    // Allows owner to withdraw funds if goal is met
    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        
        require(msg.sender == campaign.owner, "Not the owner");
        require(block.timestamp > campaign.deadline, "Campaign still active");
        require(campaign.amountCollected >= campaign.goal, "Goal not reached");
        require(!campaign.claimed, "Funds already withdrawn");

        // Set claimed before transferring to prevent reentrancy
        campaign.claimed = true;
        
        (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
        require(sent, "Transfer failed");

        emit FundsWithdrawn(_id, msg.sender, campaign.amountCollected);
    }

    // Returns funds to donors if campaign fails
    function claimRefund(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        
        require(block.timestamp > campaign.deadline, "Campaign still active");
        require(campaign.amountCollected < campaign.goal, "Goal was reached");

        uint256 amount = donations[_id][msg.sender];
        require(amount > 0, "No funds to refund");

        // Reset balance before transferring to prevent reentrancy
        donations[_id][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund failed");

        emit Refunded(_id, msg.sender, amount);
    }

    // Fetches all campaigns in a single call for the UI
    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        
        // Iterates through mapping to build an array
        for(uint i = 0; i < numberOfCampaigns;) {
            allCampaigns[i] = campaigns[i];
            unchecked { i++; } // Saves gas on each loop step
        }
        return allCampaigns;
    }
}