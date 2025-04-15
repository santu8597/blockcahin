# Crimson: Decentralized Blood & Organ Donation Platform

## Overview

Crimson is a blockchain-powered platform revolutionizing blood and organ donation. It combines AI for document analysis with smart contracts for secure, transparent, and traceable transactions. Crimson bridges hospitals, NGOs, and donors into a seamless ecosystem — ensuring every donation is recorded, incentives are fairly distributed, and fraudulent activities are proactively flagged.

## Problems Solved

- **Lack of Transparency:** Blockchain records all transactions, making donation cycles verifiable and immutable.
- **Document Verification Delays:** AI-powered OCR swiftly processes health documents uploaded to IPFS, streamlining eligibility checks.
- **Organ Smuggling & Black Market Risks:** Smart contracts meticulously track organ transfers, while AI flags suspicious patterns.
- **Donor Incentive Gaps:** NFT rewards encourage participation, acknowledging life-saving contributions and building a rewarding donor ecosystem.

## Key Features

### 1. Seamless Onboarding and Verification
- Secure health document uploads stored on IPFS (via Pinata).
- AI reads and extracts health data using OCR.
- Smart contracts verify donation eligibility automatically.

### 2. Blood Camp Registration & Staking Mechanism
- Hospitals/NGOs stake funds to register blood camps, ensuring accountability.
- Staked funds are refunded upon successful event completion.
- Partial or complete fund loss occurs for failed/canceled events.

### 3. NFT Rewards & Inventory Management
- Users register for donation camps and receive unique QR codes.
- After successful donation, QR codes are scanned to mint NFTs.
- Hospital blood inventories update in real time through blockchain logs.

### 4. Organ Donation Cycle with Smuggling Detection
- Every organ transfer is recorded on-chain for full traceability.
- AI analyzes blockchain patterns to detect suspicious activities.
- Potential smuggling cases trigger automatic alerts to law enforcement.

### 5. AI-Powered Document Analysis
- Uploaded health documents are processed via Tesseract OCR.
- AI structures and stores parsed data securely on IPFS.
- Smart contracts determine donation eligibility based on extracted data.

## Platform Workflow

1. **User Registration:** Upload health documents → AI processes via OCR → Smart contract verifies eligibility.
2. **Camp Registration:** Hospital/NGO stakes funds → Event added to the platform.
3. **Donation Process:** User registers → Receives QR code → Donates blood or organs.
4. **Post-Donation:** QR code scanned → NFT minted → Hospital inventory updated.
5. **Organ Donation:** Organ transfer recorded on-chain → AI monitors transactions → Suspicious activities flagged.

## Benefits

### For Users
- Faster, AI-powered eligibility checks.
- NFT rewards gamify and acknowledge donations.
- A secure, lifelong on-chain donation history.

### For Hospitals & NGOs
- Transparent, traceable donation cycles.
- Reduced admin burdens and faster document verification.
- Real-time blood and organ inventory tracking.

### For Law Enforcement
- On-chain organ data aids forensic investigations.
- AI pattern analysis accelerates smuggling detection.
- Faster responses to flagged transactions reduce illegal activities.

## Future Prospects

1. **IoT Integration:** Connect Crimson to smart devices for live health data and automatic eligibility updates.
2. **QR-Based Features:** Enable QR scanning for donor registration, live donation tracking, and instant medical data access.
3. **Decentralized Health Network:** Expand Crimson into a global health data network for faster research, organ matching, and patient care.

## Tech Stack

- **Frontend:** Next.js
- **Smart Contracts:** Solidity (EVM)
- **Deployment & Testing:** Foundry
- **Blockchain Network:** EDU Chain
- **OCR:** Tesseract
- **AI Chatbot:** Vercel AI SDK
- **Social Integrations:** Eliza (Twitter Bot)
- **Maps:** Leaflet
- **Web3 Tools:** Wagmi
- **Wallet Connections:** Rainbow Kit

## Deployed Addresses

### EDU Chain Testnet
- **CampHospitals.sol:** `0x5CC218a3C34E399404ad818aC166717FbF62E47f`
- **Donations.sol:** `0xE492d185E55de7f464D4C9D159C034e40BDeFC4C`
- **VialRegistration.sol:** `0xebFbd7dfB0c1403d3518302DA6531C7E80928960`
- **VialStatus.sol:** `0xc06d11448822368C0A1C9983bfC2237e0A14FFeA`
- **BloodCamp.sol:** `0x0f370764f846746f535671dd1828A8c44ceEC9F2`
- **BloodCampNFT.sol:** `0x9Bf871045157cEB7D5084c9263EACecB78C865BD`
- **OrganDonation.sol:** `0x6b19bf91DE8Ed73387972B3c4567E991dC961F21`

### Base Sepolia
- **BloodCamp.sol:** `0xdCf97Db48b9220F89eCED4336F39F3b9e58805C7`
- **BloodCampNFT.sol:** `0xa8c22c993F5BC6625FA1A96fC23D92855F4E2F1c`
- **OrganDonation.sol:** `0x6DfC9a5C0FBf827E67062eD80a3A27Ca59b80558`

---

Crimson pioneers decentralized healthcare by blending blockchain, AI, and IoT — creating a secure, efficient, and fraud-resistant donation ecosystem. It empowers donors, hospitals, and regulators, setting the stage for a healthier, more connected future.
