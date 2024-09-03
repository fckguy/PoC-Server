import { Body, Controller, Get, Param, Put, Query, UseGuards, Request, Post, Req, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { VerifySignatureGuard } from '@guards/verifySignature.guard';
import { JwtAuthGuard } from '@guards/jwt.guard';
import {
  AddUserAssetDto,
  AddUserAssetResponseDto,
  GetAllUsersResponseDto,
  GetParticipantsByUserIdParamDto,
  GetParticipantsByUserIdQueryDto,
  GetParticipantsByUserIdResponseDto,
  GetUserAssetsByUserIdParamDto,
  GetUserAssetsByUserIdQueryDto,
  GetUserAssetsByUserIdResponseDto,
  GetUserByExternalUserIdResponseDto,
  GetUserByExternalUserIdResponseQueryDto,
  GetUserByIdResponseDto,
  GetUserByIdResponseQueryDto,
  QueryUserWalletsDto,
  RemoveUserFromUserQueryDto,
  RemoveUserFromUserResponseDto,
  UpdateProfileDto,
  UpdateProfileResponseDto,
  UserSaltResponseDto,
  UserWalletsResponseDto,
} from './user.dto';
import { UserService } from './user.service';
import { UserRoleGuard } from '@guards/userRole.guard';
import { UserRole } from './user.entity';
import { PaginationQueryDto } from './pagination.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Get all users by the admin',
  })
  @ApiResponse({ status: 200, description: 'Get all users by the admin', type: GetAllUsersResponseDto })
  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @UserRoleGuard(UserRole.REPUBLIC_ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT_ADMIN)
  @Get('/')
  public async getAllUsers(@Query() query: PaginationQueryDto): Promise<GetAllUsersResponseDto> {
    return await this.userService.getAllUsers(query);
  }

  @ApiOperation({
    summary: 'Update user profile info',
  })
  @ApiResponse({ status: 200, description: 'Update user profile info', type: UpdateProfileResponseDto })
  @UseGuards(VerifySignatureGuard)
  @ApiBearerAuth('jwt-access-token')
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @UseGuards(JwtAuthGuard)
  @Put('/profile')
  public async updateProfile(@Body() data: UpdateProfileDto): Promise<UpdateProfileResponseDto> {
    return await this.userService.updateProfile(data);
  }

  @ApiOperation({
    summary: 'Returns current user data',
  })
  @ApiResponse({ status: 200, description: 'Returns current user public data', type: GetUserByIdResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/profile')
  public async getCurrentUser(@Request() req): Promise<GetUserByIdResponseDto> {
    return this.userService.getUserById(req?.user?.id, req?.user);
  }

  @ApiOperation({
    summary: "Get current user's client salt",
  })
  @ApiResponse({ status: 200, description: "Returned current user's client salt", type: UserSaltResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/salt')
  public async getCurrentUserSalt(@Request() req): Promise<UserSaltResponseDto> {
    return await this.userService.getCurrentUserSalt(req?.user?.id);
  }

  @ApiOperation({
    summary: 'Returns user wallets by specifying user id',
  })
  @ApiResponse({ status: 200, description: 'Returns user wallets', type: UserWalletsResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/:userId/wallets')
  public async getAllWalletsFromUserId(@Param() { userId }: QueryUserWalletsDto): Promise<UserWalletsResponseDto> {
    return this.userService.getUserWalletsByUserId(userId);
  }

  @ApiOperation({
    summary: 'Returns user assets by specifying user id',
  })
  @ApiResponse({ status: 200, description: 'Returns user assets', type: GetUserAssetsByUserIdResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/:userId/assets')
  public async getAssetsByUserId(
    @Param() { userId }: GetUserAssetsByUserIdParamDto,
    @Query() query: GetUserAssetsByUserIdQueryDto,
  ): Promise<GetUserAssetsByUserIdResponseDto> {
    return await this.userService.getUserAssetsByUserId(userId, query);
  }

  @ApiOperation({
    summary: "Add a new asset to the user's wallet based on the asset configuration",
  })
  @ApiResponse({ status: 201, description: 'Returns newly added asset', type: GetUserAssetsByUserIdResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Post('/assets/add')
  public async addAssetToUser(@Body() body: AddUserAssetDto, @Req() req): Promise<AddUserAssetResponseDto> {
    return await this.userService.addAssetToUser(body, req.user);
  }

  @ApiOperation({
    summary: "Remove an asset from the user's wallet based on the asset configuration",
  })
  @ApiResponse({ status: 200, description: 'Returns newly removed asset', type: RemoveUserFromUserResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Delete('/:userId/wallets/:walletId/assets/:assetConfigId')
  public async removeAssetFromUser(
    @Param() parms: RemoveUserFromUserQueryDto,
    @Req() req,
  ): Promise<RemoveUserFromUserResponseDto> {
    return await this.userService.removeAssetFromUser(parms, req?.user);
  }

  @ApiOperation({
    summary: 'Returns user public data',
  })
  @ApiResponse({ status: 200, description: 'Returns user public data', type: GetUserByIdResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/:userId')
  public async getUserByUserId(
    @Param() { userId }: GetUserByIdResponseQueryDto,
    @Request() req,
  ): Promise<GetUserByIdResponseDto> {
    return await this.userService.getUserById(userId, req?.user);
  }

  @ApiResponse({ status: 200, description: 'Returns user public data', type: GetUserByExternalUserIdResponseDto })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/:externalUserId/externalUserId')
  public async getUserByExternalUserId(
    @Param() { externalUserId }: GetUserByExternalUserIdResponseQueryDto,
  ): Promise<GetUserByExternalUserIdResponseDto> {
    return this.userService.getUserByExternalUserId(externalUserId);
  }

  @ApiOperation({
    summary: 'Returns multisig participants by user id',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns multisig participants by user id',
    type: GetParticipantsByUserIdResponseDto,
  })
  @ApiSecurity('api-key-auth')
  @ApiSecurity('client-jwt-auth')
  @Get('/:userId/multisig-transactions')
  public async getParticipantsByUserId(
    @Param() { userId }: GetParticipantsByUserIdParamDto,
    @Query() { status }: GetParticipantsByUserIdQueryDto,
  ): Promise<GetParticipantsByUserIdResponseDto> {
    return this.userService.getParticipantsByUserId({ userId, status });
  }
}
