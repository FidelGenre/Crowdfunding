// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CrowdfundingOptimized {
    struct Campaign {
        address owner;
        uint256 goal;
        uint256 deadline;
        uint256 amountCollected;
        bool claimed;
        string contentHash;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns;
    
    mapping(uint256 => mapping(address => uint256)) public donations;

    event CampaignCreated(uint256 indexed id, address indexed owner, string contentHash, uint256 goal);
    event Donated(uint256 indexed id, address indexed donor, uint256 amount);
    event Refunded(uint256 indexed id, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);

    //'calldata' en lugar de 'memory' para strings de entrada ahorra gas
    function createCampaign(
        string calldata _contentHash, 
        uint256 _goal, 
        uint256 _duration
    ) public {
        require(_goal > 0, "Meta > 0");
        require(_duration > 0, "Duracion > 0");

        // Al crear el struct, asignamos directamente a storage
        Campaign storage newCampaign = campaigns[numberOfCampaigns];
        
        newCampaign.owner = msg.sender;
        newCampaign.contentHash = _contentHash;
        newCampaign.goal = _goal;
        newCampaign.deadline = block.timestamp + _duration;
        newCampaign.amountCollected = 0;
        newCampaign.claimed = false;

        emit CampaignCreated(numberOfCampaigns, msg.sender, _contentHash, _goal);

        //Unchecked para el contador (ahorra gas en la suma)
        unchecked {
            numberOfCampaigns++;
        }
    }

    function donateToCampaign(uint256 _id) public payable {
        // Validación rápida antes de cargar storage
        require(msg.value > 0, "Enviar ETH");

        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Finalizada");

        campaign.amountCollected += msg.value;
        donations[_id][msg.sender] += msg.value;

        emit Donated(_id, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        
        // Chequeos primero
        require(msg.sender == campaign.owner, "No dueno");
        require(block.timestamp > campaign.deadline, "En curso");
        require(campaign.amountCollected >= campaign.goal, "No meta");
        require(!campaign.claimed, "Ya retirado");

        // Efectos
        campaign.claimed = true;
        
        // Interacción
        (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
        require(sent, "Fallo envio");

        emit FundsWithdrawn(_id, msg.sender, campaign.amountCollected);
    }

    function claimRefund(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        
        require(block.timestamp > campaign.deadline, "En curso");
        require(campaign.amountCollected < campaign.goal, "Meta cumplida");

        uint256 amount = donations[_id][msg.sender];
        require(amount > 0, "Sin fondos");

        //Protección contra Reentrancy: Resetear saldo ANTES de enviar
        donations[_id][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Fallo reembolso");

        emit Refunded(_id, msg.sender, amount);
    }

    // Nota: Esta función es gratis si se llama desde el frontend (View), 
    // pero fallará si hay miles de campañas.
    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        
        //Unchecked dentro del loop para ahorrar gas en iteraciones
        for(uint i = 0; i < numberOfCampaigns;) {
            allCampaigns[i] = campaigns[i];
            unchecked { i++; }
        }
        return allCampaigns;
    }
}