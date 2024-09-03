# Asset Management

- [Asset Management](#asset-management)
  - [Project Description](#project-description)
  - [User Types](#user-types)
  - [Features (Initial Scope)](#features-initial-scope)
    - [*1. Create a new Merchant*](#1-create-a-new-merchant)
      - [*1.1. Scenario 1*](#11-scenario-1)
        - [*1.1.1. Acceptance Critera*](#111-acceptance-critera)
        - [*1.1.2. Sequence Diagram*](#112-sequence-diagram)
    - [*2. Deactivate a Merchant*](#2-deactivate-a-merchant)
      - [*2.1. Scenario 1*](#21-scenario-1)
        - [*2.1.1. Acceptance Critera*](#211-acceptance-critera)
        - [*2.1.2. Sequence Diagram*](#212-sequence-diagram)
    - [*3. Active a Merchant*](#3-active-a-merchant)
      - [*3.1. Scenario 1*](#31-scenario-1)
        - [*3.1.1. Acceptance Critera*](#311-acceptance-critera)
        - [*3.1.2. Sequence Diagram*](#312-sequence-diagram)
    - [*4. Sign up as a Merchant*](#4-sign-up-as-a-merchant)
      - [*4.1. Scenario 1*](#41-scenario-1)
        - [*4.1.1. Acceptance Critera*](#411-acceptance-critera)
        - [*4.1.2. Sequence Diagram*](#412-sequence-diagram)
    - [*5. Invite Merchant Admins*](#5-invite-merchant-admins)
      - [*5.1. Scenario 1*](#51-scenario-1)
        - [*5.1.1. Acceptance Critera*](#511-acceptance-critera)
        - [*5.1.2. Sequence Diagram*](#512-sequence-diagram)
    - [*6. Revoke a Merchant Admin*](#6-revoke-a-merchant-admin)
      - [*6.1. Scenario 1*](#61-scenario-1)
        - [*6.1.1. Acceptance Critera*](#611-acceptance-critera)
        - [*6.1.2. Sequence Diagram*](#612-sequence-diagram)
    - [*7. Create API Keys*](#7-create-api-keys)
      - [*7.1. Scenario 1*](#71-scenario-1)
        - [*7.1.1. Acceptance Critera*](#711-acceptance-critera)
        - [*7.1.2. Sequence Diagram*](#712-sequence-diagram)
    - [*8. Create Assets*](#8-create-assets)
      - [*8.1. Scenario 1*](#81-scenario-1)
        - [*8.1.1. Acceptance Critera*](#811-acceptance-critera)
        - [*8.1.2. Sequence Diagram*](#812-sequence-diagram)
  - [ERD Diagram](#erd-diagram)
## Project Description

## User Types

- Wallaby Admin: The Wallaby user who will be able to deactive and activate merchant accounts
- Merchant Super Admin: The merchant user that owers the account. They can be one or many. The merchant will always have at least one Super Admin
- Merchant Admin: The merchant with less privileges than the Super Admin
## Features (Initial Scope)


### *1. Create a new Merchant*

#### *1.1. Scenario 1*

As a Wallaby Admin I want to create a new merchant account so that the Merchant can add users, create wallets, manage transactions etc.

##### *1.1.1. Acceptance Critera*

*GIVEN* I'm a Wallaby Admin <br>
*WHEN* I submit a new Merchant details <br>
*THEN* A new merchant account is created and an email is send to the email merchant


##### *1.1.2. Sequence Diagram*

```mermaid
sequenceDiagram
  autonumber
  participant Wallaby Admin
  participant Merchant
  participant Wallaby API Service

  Wallaby Admin->>+Wallaby API Service: Submit details of a new merchant account creation
  Note over Merchant,Wallaby API Service: POST /api/v1/merchants<br>{ companyName, adminEmail, adminFirstName, <br>adminLastName, adminGender, allowedOrigins }

  Wallaby API Service->>Wallaby API Service: Generate Key API Key
  Wallaby API Service->>Wallaby API Service: Persist the generated API Key

  Wallaby API Service->>Wallaby API Service: Generate a password for the Merchant Super Admin
  Wallaby API Service->>Wallaby API Service: Persist the Merchant Super Admin Password
  Wallaby API Service->>Merchant: Send the Merchant Super Admin Credentials via email

  Wallaby API Service->>-Wallaby Admin: Return merchant details
  Note over Wallaby API Service,Wallaby Admin: returns { apiKey: { appName, merchantId, status } }
```

### *2. Deactivate a Merchant*

#### *2.1. Scenario 1*

As a Wallaby Admin I want to deactivate a merchant account so that the Merchant stops having access to account.

##### *2.1.1. Acceptance Critera*

*GIVEN* I'm a Wallaby Admin <br>
*WHEN* I deactivate a Merchant account <br>
*THEN* The Merchant should stop having access to the account


##### *2.1.2. Sequence Diagram*
```mermaid
sequenceDiagram
  autonumber
  participant Wallaby Admin
  participant Merchant Owners
  participant Wallaby API Service

  Wallaby Admin->>+Wallaby API Service: Submit a deactivation request
  Note over Wallaby Admin,Wallaby API Service: POST /api/v1/merchants/:id/deactivate<br>{ reason }

  Wallaby API Service->>Wallaby API Service: Change the account status to deactivated

  Wallaby API Service->>Merchant Owners: Send a deactivation email to the account's owners

  Wallaby API Service->>-Wallaby Admin: Returns a success message
  Note over Wallaby API Service,Wallaby Admin: JSON { message }
```

### *3. Active a Merchant*

#### *3.1. Scenario 1*

As a Wallaby Admin I want to active a merchant from a revoked or inactive state so that the Merchant can start or resume having access to account.

##### *3.1.1. Acceptance Critera*

*GIVEN* I'm a Wallaby Admin <br>
*WHEN* I activate a Merchant account <br>
*THEN* The Merchant should start or resume having access to the account


##### *3.1.2. Sequence Diagram*
```mermaid
sequenceDiagram
  autonumber
  participant Wallaby Admin
  participant Merchant Owners
  participant Wallaby API Service

  Wallaby Admin->>+Wallaby API Service: Submit a activation request
  Note over Wallaby Admin,Wallaby API Service: POST /api/v1/merchants/:id/activate<br>{ reason }

  Wallaby API Service->>Wallaby API Service: Change the account status to active

  Wallaby API Service->>Merchant Owners: Send an activation email to the account's owners

  Wallaby API Service->>-Wallaby Admin: Returns a success message
  Note over Wallaby API Service,Wallaby Admin: JSON { message }
```



### *4. Sign up as a Merchant*

#### *4.1. Scenario 1*

##### *4.1.1. Acceptance Critera*
As a new Merchant I want to sign up so that I can add users, create wallets, etc.

*GIVEN* I'm a new Merchant <br>
*WHEN* I submit my company details <br>
*THEN* My submission requests goes to pending review
##### *4.1.2. Sequence Diagram*

```mermaid
sequenceDiagram
  autonumber
  participant Merchant
  participant Wallaby API Service
  participant Wallaby KMS Service
  participant GCP Secure Key Management

  Merchant->>+Wallaby API Service: Company Name, Admin details (First Name, Last Name and Email) and Allowed Origins
  Note over Merchant,Wallaby API Service: POST /api/v1/merchants<br>{ companyName, adminEmail, adminFirstName, <br>adminLastName, adminGender, allowedOrigins }

  Wallaby API Service->>Wallaby API Service: Generate Key API Key
  Wallaby API Service->>Wallaby API Service: Persist the generated API Key

  Wallaby API Service->>Wallaby API Service: Generate a password for the Super Admin
  Wallaby API Service->>Wallaby API Service: Persist the Super Admin Password
  Wallaby API Service->>Wallaby API Service: Send the Super Admin Credentials via email

  Wallaby API Service->>-Merchant: Return the API Key to the merchant
  Note over Wallaby API Service,Merchant: JSON { apiKey: { appName, merchantId, status } }
```

<br>

### *5. Invite Merchant Admins*

#### *5.1. Scenario 1*

As a *Merchant Super Admin* I want to invite new admins to that they can access the merchant overal information (users, wallets, transactions, etc)

##### *5.1.1. Acceptance Critera*

*GIVEN* A Merchant Super Admin <br>
*WHEN* I invite new admins <br>
*THEN* They should be able to access the merchant overal information (users, wallets, transactions, etc)

##### *5.1.2. Sequence Diagram*
```mermaid
sequenceDiagram
  autonumber
  participant Merchant Admin
  participant Wallaby API Service

  Merchant Admin->>+Wallaby API Service: Submits new admin details
  Note over Merchant Admin,Wallaby API Service: POST /api/v1/merchants/:id/admins<br>{ email, firstName, lastName, gender, role }

  Wallaby API Service->>Wallaby API Service: Generate a password for the Super Admin
  Wallaby API Service->>Wallaby API Service: Persist the Super Admin Password
  Wallaby API Service->>Wallaby API Service: Send the Super Admin Credentials via email

  Wallaby API Service->>-Merchant Admin: Returns the newly created admin details
  Note over Merchant Admin, Wallaby API Service: JSON { admin: { email, firstName, lastName, gender, role } }
```

### *6. Revoke a Merchant Admin*

#### *6.1. Scenario 1*

As a Merchant Super Admin I want to revoke an admin account so that they can stop having access to account.

##### *6.1.1. Acceptance Critera*

*GIVEN* I'm a Merchant Super Admin <br>
*WHEN* I revoke a Merchant admin <br>
*THEN* The admin should stop having access to the account


##### *6.1.2. Sequence Diagram*
```mermaid
sequenceDiagram
  autonumber
  participant Merchant Super Admin
  participant Merchant Owner
  participant Wallaby API Service

  Merchant Super Admin->>+Wallaby API Service: Submit a revocation request
  Note over Merchant Super Admin,Wallaby API Service: POST /api/v1/merchants/:merchantId/admins/:adminId/revoke<br>{ reason }

  Wallaby API Service->>Wallaby API Service: Change the account status to revoked

  Wallaby API Service->>Merchant Owner: Send a revocation email to the account's owner

  Wallaby API Service->>-Merchant Super Admin: Returns a success message
  Note over Wallaby API Service,Merchant Super Admin: JSON { message }
```

<br>


### *7. Create API Keys*

#### *7.1. Scenario 1*

As a *Merchant Super Admin* I want to create new API Keys that I can be able to do external integration to the wallet

##### *7.1.1. Acceptance Critera*

*GIVEN* A Merchant Super Admin <br>
*WHEN* I submit create a new API Key request<br>
*THEN* The system should create a new API Key available for integration

##### *7.1.2. Sequence Diagram*
```mermaid
sequenceDiagram
  autonumber
  participant Merchant Admin
  participant Wallaby API Service

  Merchant Admin->>+Wallaby API Service: Submits new API Key details
  Note over Merchant Admin,Wallaby API Service: POST /api/v1/merchants/:id/api-keys<br>{ appName }

  Wallaby API Service->>Wallaby API Service: Generate a new API Key
  Wallaby API Service->>Wallaby API Service: Generate API Key Client Auth Keys a new API Key
  Wallaby API Service->>Wallaby API Service: Persist the newly generate API Key with the Client Auth Pub Key

  Wallaby API Service->>-Merchant Admin: Returns the newly created API Key details
  Note over Merchant Admin, Wallaby API Service: JSON { apiKey: { merchantId, key, clientAuthPubKey } }
```

<br>

### *8. Create Assets*

#### *8.1. Scenario 1*

As a *Merchant Super Admin* I want to create new Assets that they can be used when creating new wallets

##### *8.1.1. Acceptance Critera*

*GIVEN* A Merchant Super Admin <br>
*WHEN* I submit create a new Asset Config request<br>
*THEN* The system should create a new Asset available for new wallet creation

##### *8.1.2. Sequence Diagram*
```mermaid
sequenceDiagram
  autonumber
  participant Merchant Super Admin
  participant Wallaby API Service

  Merchant Super Admin->>+Wallaby API Service: Submits new Asset Config details
  Note over Merchant Super Admin,Wallaby API Service: POST /api/v1/merchants/:id/assets-config<br>{ name, symbol, decimals, index, type, tokenStandard, <br> ownershipType, multisigVersion, contractAddress }

  Wallaby API Service->>Wallaby API Service: Persist asset details

  Wallaby API Service->>-Merchant Super Admin: Returns the newly created asset
  Note over Merchant Super Admin, Wallaby API Service: JSON { asset: { id, merchantId, name, symbol, decimals,  <br> index,  type, tokenStandard, ownershipType,  <br> multisigVersion, contractAddress } }
```


<br>

## ERD Diagram

```mermaid
erDiagram
 
  Merchant {
    int id PK
    string name
    date createdAt
  }
  ApiKey {
    int id PK
    int merchantId FK "Foreign key to Merchant"
    string appName
    string key
    date createdAt
  }
  Chain {
    int id PK
    string name
    string mainnetId
    string mainnetRpcUrl
    string mainnetIndexUrl
    string testnetId
    string testnetRpcUrl
    string testnetIndexUrl
    string derivationPath
    string addressRegx
    int slip44
    date createdAt
  }
  MerchantAdmin {
    int id PK
    int merchantId FK "Foreign key to Merchant"
    string email
    string username
    string firstName
    string lastName
    string middleName
    string password
    string role "super_admin, admin"
    string status "active, inactive, deactivate, revoked"
    date createdAt
  }
  MerchantUser {
    int id PK
    int merchantId FK "Foreign key to Merchant id PK"
    string email
    string username
    string firstName
    string lastName
    string middleName
    string latestWallabyAuthPubKey
    string latestWallabyAuthPubKeyVersion
    string hashingSalt
    string status "active, inactive, deactivated"
    date createdAt
  }
  MerchantAssetConfig {
    int id PK
    int merchantId FK "Foreign key to Merchant id PK"
    int chainId FK "Foreign key to Chain id PK"
    string name
    string symbol
    int decimals
    int index
    string type "TOKEN, COIN"
    string tokenStandard "ERC20, ALGO_APP"
    string ownershipType "SINGLE, MULTISIG"
    int multisigVersion
    string contractAddress
    string status "active, inactive"
    date createdAt
  }
  MerchantUserWallet {
    int id PK
    int merchantId FK "Foreign key to Merchant id PK"
    int merchantUserId FK "Foreign key to MerchantUser id PK"
    string hashedSeedPhrase
    string hashedSeedPhraseSalt
    date createdAt
  }
  MerchantUserWalletAsset {
    int id PK
    int merchantId FK "Foreign key to Merchant id PK"
    int merchantUserId FK "Foreign key to MerchantUser id PK"
    int merchantUserWalletId FK "Foreign key to MerchantUserWallet id PK"
    int merchantAssetConfigId FK "Foreign key to MerchantAssetConfig id PK"
    int chainId FK "Foreign key to Chain id PK"
    string assetName
    string walletAddress
    date createdAt
  }
  MerchantUserTransaction {
    int id PK
    int merchantId FK "Foreign key to Merchant id PK"
    int merchantUserId FK "Foreign key to MerchantUser id PK"
    int merchantAssetConfigId FK "Foreign key to MerchantAssetConfig id PK"
    int chainId FK "Foreign key to Chain id PK"
    string fromAddress
    string toAddress
    string reference
    string hash
    string status "pending, failed, succeeded"
    date createdAt
  }

  Merchant ||--}| MerchantAdmin: "has one or more"
  Merchant ||--}o ApiKey: "has zero or more"
  Merchant ||--}o MerchantUser: "has zero or more"
  Merchant ||--}o MerchantUserWallet: "has zero or more"
  Merchant ||--}o MerchantAssetConfig: "has zero or more"
  Chain ||--}o MerchantAssetConfig: "has zero or more"
  Chain ||--}o MerchantUserTransaction: "has zero or more"
  Chain ||--}o MerchantUserWalletAsset: "has zero or more"
  MerchantUser ||--}o MerchantUserWallet: "has zero or more"
  MerchantUserWallet ||--}o MerchantUserWalletAsset: "has zero or more"
  MerchantAssetConfig ||--}o MerchantUserWalletAsset: "has zero or more"
```
