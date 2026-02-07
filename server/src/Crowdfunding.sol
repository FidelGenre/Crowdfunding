// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CrowdfundingOptimized {
    // Estructura "Ligera" (Ahorra mucho Gas)
    struct Campaign {
        address owner;
        string contentHash; // CID de IPFS (apunta al JSON con titulo, desc, img)
        uint256 goal;
        uint256 deadline;
        uint256 amountCollected;
        bool claimed;
    }

    // Almacenamiento
    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns;
    
    // Mapping para rastrear donaciones: ID Campaña => Donante => Cantidad
    mapping(uint256 => mapping(address => uint256)) public donations;

    // Eventos (Crucial para que tu Frontend sepa qué pasó sin gastar gas de lectura)
    event CampaignCreated(uint256 indexed id, address indexed owner, string contentHash, uint256 goal);
    event Donated(uint256 indexed id, address indexed donor, uint256 amount);
    event Refunded(uint256 indexed id, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);

    // --- FUNCIONES ---

    function createCampaign(
        string memory _contentHash, // Ejemplo: "QmXoypizjW3WknFiJnKLw..."
        uint256 _goal, 
        uint256 _duration
    ) public {
        require(_goal > 0, "La meta debe ser mayor a 0");
        require(_duration > 0, "La duracion debe ser valida");

        campaigns[numberOfCampaigns] = Campaign({
            owner: msg.sender,
            contentHash: _contentHash,
            goal: _goal,
            deadline: block.timestamp + _duration,
            amountCollected: 0,
            claimed: false
        });

        emit CampaignCreated(numberOfCampaigns, msg.sender, _contentHash, _goal);
        numberOfCampaigns++;
    }

    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        
        // Validaciones (Optimizadas con mensajes cortos para ahorrar despliegue)
        require(block.timestamp < campaign.deadline, "Campana finalizada");
        require(msg.value > 0, "Debes enviar ETH");

        campaign.amountCollected += msg.value;
        donations[_id][msg.sender] += msg.value;

        emit Donated(_id, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        
        require(msg.sender == campaign.owner, "No eres el dueno");
        require(block.timestamp > campaign.deadline, "Aun en curso");
        require(campaign.amountCollected >= campaign.goal, "Meta no alcanzada");
        require(!campaign.claimed, "Ya retirado");

        campaign.claimed = true;
        
        // Transferencia segura
        (bool sent, ) = payable(campaign.owner).call{value: campaign.amountCollected}("");
        require(sent, "Fallo el envio");

        emit FundsWithdrawn(_id, msg.sender, campaign.amountCollected);
    }

    function claimRefund(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        
        require(block.timestamp > campaign.deadline, "Aun en curso");
        require(campaign.amountCollected < campaign.goal, "La meta se cumplio, no hay reembolso");

        uint256 amount = donations[_id][msg.sender];
        require(amount > 0, "No has donado nada");

        // Efecto antes de Interacción (Seguridad contra Reentrancy)
        donations[_id][msg.sender] = 0;
        // Nota: No restamos de amountCollected porque la campaña ya falló, 
        // solo importa devolver el dinero individual.

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Fallo el reembolso");

        emit Refunded(_id, msg.sender, amount);
    }

    // Función de lectura auxiliar para obtener todas de una vez (Cuidado con listas gigantes)
    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        for(uint i = 0; i < numberOfCampaigns; i++) {
            allCampaigns[i] = campaigns[i];
        }
        return allCampaigns;
    }
}