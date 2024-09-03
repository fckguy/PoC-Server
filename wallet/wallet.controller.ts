import { Body, Controller, Post, UseGuards, Get, Param, UseInterceptors, Query, Req, Put } from '@nestjs/common';
import { WalletService } from '@modules/wallet/wallet.service';
import {
  WalletCreatedDto,
  GetUserAssetResponseDto,
  GetWalletAssetParamDto,
  MultisigCreationRequestDto,
  InitiateWalletRecoveryDto,
  WalletCompleteRecoveryCodeDto,
  WalletCompleteRecoveryCodeResponseDto,
  InitiateWalletRecoveryResponseDto,
  MnemonicConversionToAlgoSpecificRequestDto,
  MnemonicConversionToAlgoSpecificResponseDto,
  WalletSeedImportRequestDto,
  MultisigCreationResponseDto,
  UserAssetDto,
  GetUserAssetRequestDto,
  GetAllWalletsResponseDto,
  GetWalletAssetQueryDto,
  UpdateUserAssetRequestDto,
  UpdateUserAssetResponseDto,
} from '@modules/wallet/wallet.dto';

import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { VerifySignatureGuard } from '@guards/verifySignature.guard';
import { AuthGuardDto } from '@modules/auth/auth.dto';
import { UserAsset } from '@modules/user/user-asset.entity';
import { SentryInterceptor } from '@interceptors/sentry.interceptor';
import { JwtAuthGuard } from '@guards/jwt.guard';
import { CustomRequest } from '@root/types/CustomRequest';
import { UserRole } from '@modules/user/user.entity';
import { PaginationQueryDto } from '@modules/user/pagination.dto';
import { UserRoleGuard } from '@guards/userRole.guard';
import { UserService } from '@modules/user/user.service';

@ApiTags('Wallets')
@UseInterceptors(SentryInterceptor)
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletsService: WalletService, private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Get all wallets by the admin',
  })
  @ApiResponse({ status: 200, description: 'Get all wallets by the admin', type: GetAllWalletsResponseDto })
  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @UseGuards(JwtAuthGuard)
  @UserRoleGuard(UserRole.REPUBLIC_ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT_ADMIN)
  @Get('/')
  public async getAllUsers(@Query() query: PaginationQueryDto): Promise<GetAllWalletsResponseDto> {
    return await this.walletsService.getAllWallets(query);
  }

  @ApiOperation({
    summary: 'Create a newly fresh wallet, returns asset list and encrypted seed',
  })
  @ApiResponse({ status: 201, description: 'The wallet has been created successfully', type: WalletCreatedDto })
  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @UseGuards(JwtAuthGuard)
  @UseGuards(VerifySignatureGuard)
  @Post('/create')
  public async createWallet(@Body() createWalletRequest: AuthGuardDto): Promise<WalletCreatedDto> {
    return this.walletsService.createWallet(createWalletRequest);
  }

  @ApiOperation({
    summary: 'Import an existing wallet seed phrase into wallaby system directly',
  })
  @ApiResponse({
    status: 200,
    description: 'The mnemonic seed phrase has been imported and wallet created successfully',
    type: WalletCreatedDto,
  })
  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @UseGuards(VerifySignatureGuard)
  @Post('/import-seed-phrase')
  public async importWalletSeedPhrase(
    @Body() walletSeedImportRequestDto: WalletSeedImportRequestDto,
  ): Promise<WalletCreatedDto> {
    return this.walletsService.importWalletSeed(walletSeedImportRequestDto);
  }

  @ApiOperation({
    summary: 'Get all assets that exist in a certain wallet, by specifying a wallet ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all assets belonging in a certain wallet ID',
    type: GetUserAssetResponseDto,
  })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/:walletId/assets')
  public async getUserAssetsByWalletId(
    @Param() { walletId }: GetWalletAssetParamDto,
    @Query() query: GetWalletAssetQueryDto,
  ): Promise<GetUserAssetResponseDto> {
    return this.walletsService.getWalletAssets(walletId, query);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: "Get one asset from a user's wallet",
  })
  @ApiResponse({
    status: 200,
    description: 'Asset was fetched successfully',
    type: UserAssetDto,
  })
  @ApiResponse({ status: 404, description: 'User asset not found' })
  @Get('/asset')
  @ApiQuery({
    name: 'blockchainName',
    type: String,
    example: 'ETHEREUM',
    description: 'Blockchain name',
    required: true,
  })
  @ApiQuery({
    name: 'assetSymbol',
    type: String,
    example: 'USDT',
    description: 'Asset symbol, for instance: USDT, ETH, ALGO, etc, ...',
    required: true,
  })
  async getUserAsset(@Body() body: GetUserAssetRequestDto, @Req() req: CustomRequest): Promise<UserAssetDto> {
    return this.walletsService.getUserAsset(body, req.user);
  }

  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiOperation({
    summary: 'Update a specific asset in a wallet',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset was updated successfully',
    type: UserAssetDto,
  })
  @ApiResponse({ status: 404, description: 'User asset not found' })
  @Put('/asset/update')
  @ApiQuery({
    name: 'assetSymbol',
    type: String,
    example: 'ETH',
    description: 'Asset symbol',
    required: false,
  })
  @ApiQuery({
    name: 'isVisible',
    type: Boolean,
    description: 'Asset visibility toggle',
    required: false,
  })
  @ApiQuery({
    name: 'assetName',
    type: String,
    example: 'Ether',
    description: 'Asset name',
    required: false,
  })
  @ApiQuery({
    name: 'configId',
    type: String,
    example: '6e464058-67c1-4273-a6a4-8aae522e34be',
    description: 'Config ID for the user asset',
    required: true,
  })
  @ApiQuery({
    name: 'walletId',
    type: String,
    example: '6e464058-67c1-4273-a6a4-8aae522e34be',
    description: 'Wallet ID to which the asset belongs',
    required: true,
  })
  async updateUserAsset(
    @Body() body: UpdateUserAssetRequestDto,
    @Req() req: CustomRequest,
  ): Promise<UpdateUserAssetResponseDto> {
    return this.walletsService.updateUserAsset(body, req.user);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiTags('Multisig')
  @ApiOperation({
    summary: 'Initiate creation for a new multisig asset, by specifying participants and the threshold',
  })
  @ApiResponse({ status: 201, description: 'Multisig asset was created successfully', type: UserAsset })
  @ApiResponse({ status: 400, description: 'Failed creating multisig, check addresses provided' })
  @UseGuards(JwtAuthGuard)
  @Post('/create-multisig-asset')
  public async createMultisigAsset(
    @Body() multisigCreationRequestDto: MultisigCreationRequestDto,
  ): Promise<MultisigCreationResponseDto> {
    return this.walletsService.createOrRetrieveMultisigAsset(multisigCreationRequestDto);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiTags('Recovery')
  @ApiOperation({
    summary: 'Wallet Recovery - Step 1: Initiate wallet recovery',
  })
  @ApiResponse({
    status: 200,
    type: InitiateWalletRecoveryResponseDto,
  })
  @Post('/recover/init')
  public async initiateWalletRecovery(
    @Body() data: InitiateWalletRecoveryDto,
  ): Promise<InitiateWalletRecoveryResponseDto> {
    return this.walletsService.initiateWalletRecovery(data);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiTags('Recovery')
  @ApiOperation({
    summary: 'Wallet Recovery - Step 2 and final: Recover the lost wallet and its assets',
  })
  @ApiResponse({
    status: 200,
    description: 'The wallet has been recovered successfully',
    type: WalletCompleteRecoveryCodeResponseDto,
  })
  @UseGuards(VerifySignatureGuard)
  @Post('/recover')
  public async recoverWallet(
    @Body() recoverWallet: WalletCompleteRecoveryCodeDto,
  ): Promise<WalletCompleteRecoveryCodeResponseDto> {
    return this.walletsService.recoverWallet(recoverWallet);
  }

  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @ApiTags('Algorand')
  @ApiOperation({
    summary: 'Convert BIP39 Standard seed phrase to Algorand fixed 25 words mnemonic phrase',
  })
  @ApiResponse({
    status: 200,
    description: 'The mnemonic seed phrase has been converted successfully',
  })
  @UseGuards(VerifySignatureGuard)
  @Post('/convert-mnemonic-seed')
  public async convertStandardPhraseToAlgoSpecific(
    @Body() mnemonicConversionRequest: MnemonicConversionToAlgoSpecificRequestDto,
  ): Promise<MnemonicConversionToAlgoSpecificResponseDto> {
    return this.walletsService.convertStandardPhraseToAlgoSpecificPhrase(mnemonicConversionRequest);
  }
}
