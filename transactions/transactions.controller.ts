import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  CacheTTL,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  TransferRequestDto,
  TransactionResponseDto,
  AssetOptInRequestDto,
  FeeEstimatesRequestDto,
  FeeEstimatesResponseDto,
  AppOptInRequestDto,
  RawTxRequestDto,
  InitMultiSigTransferRequestDto,
  SignOnMultiSigRequestDto,
  InitMultisigTransferResponseDto,
  TransactionStatusDataResponseDto,
  MultiSigAssetOptInRequestDto,
  MultiSigAppOptInRequestDto,
  RawMultiTxInitiationRequestDto,
  GetTransactionParticipantResponseDto,
  GetTransactionParticipantQueryDto,
  DetectTransferRestrictionRequestDto,
  DetectTransferRestrictionResponseDto,
  MessageForTransferRestrictionResponseDto,
  MessageForTransferRestrictionRequestDto,
  AccountOptinQuery,
  AllowanceTransactionResponseDto,
  AllowanceTransactionRequestDto,
} from '@modules/transactions/transactions.dto';
import { TransactionsService } from '@modules/transactions/transactions.service';
import { ChainName } from '@modules/asset/models/asset.models';
import { VerifySignatureGuard } from '@guards/verifySignature.guard';
import { testAccount } from '@test/data/accounts';
import { SentryInterceptor } from '@interceptors/sentry.interceptor';
import { Transaction } from '@modules/transactions/transaction.entity';

@ApiTags('Transactions')
@UseInterceptors(SentryInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Post('/transfer')
  @ApiResponse({
    status: 200,
    description: 'Transfer transaction was broad-casted successfully',
    type: TransactionResponseDto,
  })
  @ApiOperation({
    summary: 'Request transferring funds to a recipient address',
  })
  @UseGuards(VerifySignatureGuard)
  public async sendTransaction(@Body() transferRequest: TransferRequestDto) {
    return this.transactionsService.handleTransfer(transferRequest);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'User initiating and signing a multi-sig transfer request',
  })
  @UseGuards(VerifySignatureGuard)
  @Post('/init-multisig-transfer')
  public async initMultisigTransfer(
    @Body() initMultiSigTransferRequestDto: InitMultiSigTransferRequestDto,
  ): Promise<InitMultisigTransferResponseDto | null> {
    return this.transactionsService.initMultisigTransferRequest(initMultiSigTransferRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary:
      'User initiating a multi-sig asset optin request and subsequently signs the first signature on the request',
  })
  @ApiTags('Multisig')
  @UseGuards(VerifySignatureGuard)
  @Post('/init-multisig-asset-optin')
  public async initMultisigAssetOptin(
    @Body() multiSigAssetOptInRequestDto: MultiSigAssetOptInRequestDto,
  ): Promise<InitMultisigTransferResponseDto | null> {
    return this.transactionsService.initMultisigOptinTransaction(multiSigAssetOptInRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'User initiating a multi-sig app optin request and subsequently signs the first signature on the request',
  })
  @ApiTags('Multisig')
  @UseGuards(VerifySignatureGuard)
  @Post('/init-multisig-app-optin')
  public async initMultisigAppOptin(
    @Body() multiSigAppOptInRequestDto: MultiSigAppOptInRequestDto,
  ): Promise<InitMultisigTransferResponseDto | null> {
    return this.transactionsService.initMultisigOptinTransaction(multiSigAppOptInRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary:
      'Append signature to an existing multisig transaction request: It can be a request to transfer, optin, etc, ...',
  })
  @ApiTags('Multisig')
  @Post('/sign-multisig-request')
  @UseGuards(VerifySignatureGuard)
  public async signOnMultisigTransactionRequest(@Body() signOnMultiSigRequestDto: SignOnMultiSigRequestDto) {
    return this.transactionsService.signOnMultiSigTransactionRequest(signOnMultiSigRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Post('/asset-optin')
  @ApiTags('Optin')
  @ApiResponse({
    status: 200,
    description: 'Asset optin transaction was broad-casted successfully',
    type: TransactionResponseDto,
  })
  @ApiOperation({
    summary: 'Transaction for optin to receive a specific asset in the future',
  })
  public async assetOptInTransaction(@Body() assetOptInRequestDto: AssetOptInRequestDto) {
    return this.transactionsService.handleAssetOptInRequest(assetOptInRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Post('/app-optin')
  @ApiTags('Optin')
  @ApiResponse({
    status: 200,
    description: 'Application optin transaction was broad-casted successfully',
    type: TransactionResponseDto,
  })
  @ApiOperation({
    summary: 'Transaction for optin to interact with a specific app',
  })
  public async appOptInTransaction(@Body() appOptInRequestDto: AppOptInRequestDto) {
    return this.transactionsService.handleAppOptInRequest(appOptInRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/estimate-fee')
  @ApiResponse({
    status: 200,
    description: 'Fee estimate value was returned successfully',
    type: FeeEstimatesResponseDto,
  })
  @ApiOperation({
    summary: 'Request fee estimate for a particular transaction',
  })
  public async getEstimateFee(@Query() feeEstimatesRequestDto: FeeEstimatesRequestDto) {
    return this.transactionsService.estimateTransactionFee(feeEstimatesRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiTags('Raw', 'Transactions')
  @Post('/sign-broadcast-rawtx')
  @ApiOperation({
    summary: 'Sign and broadcast raw transaction API',
    description:
      'The sign and broadcast transaction API was designed and implemented specifically for uses cases where the caller has their own custom raw transaction' +
      ' that is not yet currently supported by Wallaby',
  })
  @ApiResponse({
    status: 200,
    description: 'Raw transaction was signed and broad-casted successfully',
    type: TransactionResponseDto,
  })
  public async signAndBroadcastRawTx(@Body() rawTransaction: RawTxRequestDto) {
    return this.transactionsService.signRawTransaction(rawTransaction);
  }
  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Post('/sui/transfer')
  @ApiResponse({
    status: 200,
    description: 'Sui transfer transaction was broad-casted successfully',
    type: TransactionResponseDto,
  })
  @ApiOperation({
    summary: 'Request transferring Sui assets to a recipient address',
  })
  @UseGuards(VerifySignatureGuard)
  public async sendSuiTransaction(@Body() suiTransferRequest: TransferRequestDto) {
    return this.transactionsService.handleTransfer(suiTransferRequest);
  }
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @CacheTTL(10)
  @ApiTags('Query')
  @Get('/status')
  @ApiOperation({
    summary: 'Fetch transaction status data using a reference or transaction hash',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction status data returned successfully',
    type: TransactionStatusDataResponseDto,
  })
  @ApiQuery({
    name: 'transactionReference',
    type: String,
    example: testAccount.externalUserId,
    description: 'Transaction reference, this is a system level reference given to a transaction',
    required: false,
  })
  @ApiQuery({
    name: 'transactionHash',
    type: String,
    example: testAccount.hash,
    description: 'Transaction hash that uniquely identifies a transaction on-chain',
    required: false,
  })
  @ApiQuery({
    name: 'chain',
    enum: ChainName,
    example: ChainName.ETHEREUM,
    description: 'The chain on which the transaction was broadcasted on',
    required: true,
  })
  public async fetchTransactionByHashOrReference(
    @Query('chain') chain: ChainName,
    @Query('transactionReference') transactionReference?: string,
    @Query('transactionHash') transactionHash?: string,
  ): Promise<TransactionStatusDataResponseDto> {
    if (!transactionHash && !transactionReference) {
      throw new BadRequestException({ message: 'Please provide either a transaction hash or reference' });
    }

    return this.transactionsService.findTransactionByHashOrReference({
      transactionReference,
      transactionHash,
      chain,
    });
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'Initiate a multisig raw transaction and sign the first signature on that same transaction',
  })
  @ApiTags('Transactions', 'Multisig', 'Raw')
  @Post('/init-sign-broadcast-multisig-rawtx')
  @UseGuards(VerifySignatureGuard)
  public async initMultisigRawTransaction(@Body() rawMultiTxInitRequestDto: RawMultiTxInitiationRequestDto) {
    return this.transactionsService.initiateMultisigRawTxSignAndBroadcast(rawMultiTxInitRequestDto);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @CacheTTL(10)
  @ApiTags('Query')
  @Get('/raw-status')
  @ApiOperation({
    summary: 'Fetch transaction in raw data format from the system persistence',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction data returned successfully',
    type: Transaction,
  })
  @ApiQuery({
    name: 'transactionReference',
    type: String,
    example: testAccount.externalUserId,
    description: 'Transaction reference, this is a system level reference given to a transaction',
    required: true,
  })
  public async getDetailedRawTransactionDataByReference(@Query('transactionReference') transactionReference: string) {
    return this.transactionsService.getDetailedRawTransactionDataByReference(transactionReference);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @CacheTTL(10)
  @ApiTags('Query')
  @Get('/:reference/participants')
  @ApiOperation({
    summary: "Fetch transaction's participants",
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction status data returned successfully',
    type: GetTransactionParticipantResponseDto,
  })
  public async fetchTransactionParticipants(
    @Param() { reference }: GetTransactionParticipantQueryDto,
  ): Promise<GetTransactionParticipantResponseDto> {
    return this.transactionsService.findTransactionParticipants(reference);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'Request to detect whether there is a transfer restriction on a particular transaction',
  })
  @ApiResponse({
    status: 200,
    description: 'Restriction info returned successfully',
    type: DetectTransferRestrictionResponseDto,
  })
  @ApiTags('Transactions', 'ERC1404')
  @Get('/detect-transfers-restrictions')
  public async detectTransferRestriction(
    @Query() detectTransferRestrictionRequestDto: DetectTransferRestrictionRequestDto,
  ) {
    return this.transactionsService.checkTransferRestriction(detectTransferRestrictionRequestDto);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'Request restriction message by providing a restriction code',
  })
  @ApiResponse({
    status: 200,
    description: 'Restriction message info returned successfully',
    type: MessageForTransferRestrictionResponseDto,
  })
  @ApiTags('Transactions', 'ERC1404')
  @Get('/transfer-restriction-message')
  public async fetchMessageForTransferRestriction(
    @Query() messageForTransferRestrictionRequestDto: MessageForTransferRestrictionRequestDto,
  ) {
    return this.transactionsService.getMessageForTransferRestriction(messageForTransferRestrictionRequestDto);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary:
      'Get the list of all assets that the current account has opted into. This is only relevant for the Algorand chain',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of assets opted into',
  })
  @ApiTags('Optin')
  @Get('/check-asset-optin')
  public async checkAssetOptinForAddress(@Query() accountAssetOptinQuery: AccountOptinQuery) {
    return this.transactionsService.checkAssetsOptinForAddress(accountAssetOptinQuery.address);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary:
      'Get the list of all apps that the current account has opted into. This is only relevant for the Algorand chain',
  })
  @ApiTags('Optin')
  @Get('/check-app-optin')
  public async checkAppOptinForAddress(@Query() accountAssetOptinQuery: AccountOptinQuery) {
    return this.transactionsService.checkApplicationsOptinForAddress(accountAssetOptinQuery.address);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'Create an allowance for others to spend on your behalf',
  })
  @ApiResponse({
    status: 200,
    description: 'Allowance has been created successfully',
    type: AllowanceTransactionResponseDto,
  })
  @ApiTags('Allowance', 'Transaction')
  @Post('/create-allowance')
  public async createAllowanceTranasction(
    @Body() allowanceTransaction: AllowanceTransactionRequestDto,
  ): Promise<AllowanceTransactionResponseDto | null> {
    return this.transactionsService.createAllowanceTransaction(allowanceTransaction);
  }
}
