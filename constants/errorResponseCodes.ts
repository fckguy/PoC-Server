export enum ErrorResponseCodes {
  // Request Payload
  'request_payload_missing' = 'request_payload_missing',
  'request_payload_wrong_format' = 'request_payload_wrong_format',

  // Auth API Key
  'auth_api_key_invalid' = 'auth_api_key_invalid',
  'auth_api_key_not_active' = 'auth_api_key_not_active',
  'auth_api_key_pub_key_not_set' = 'auth_api_key_pub_key_not_set',
  'auth_api_key_not_provided' = 'auth_api_key_not_provided',
  'auth_api_key_not_found' = 'auth_api_key_not_found',

  // Auth Origin
  'auth_origin_not_allowed' = 'auth_origin_not_allowed',

  // Auth API JWT
  'auth_api_jwt_invalid' = 'auth_api_jwt_invalid',
  'auth_api_jwt_not_active' = 'auth_api_jwt_not_active',
  'auth_api_jwt_not_provided' = 'auth_api_jwt_not_provided',

  // Auth Client JWT
  'auth_client_jwt_invalid' = 'auth_client_jwt_invalid',
  'auth_client_jwt_missing_external_id_payload' = 'auth_client_jwt_missing_external_id_payload',
  'auth_client_jwt_missing_exp_payload' = 'auth_client_jwt_missing_exp_payload',
  'auth_client_jwt_external_id_not_match' = 'auth_client_jwt_external_id_not_match',
  'auth_client_jwt_expired' = 'auth_client_jwt_expired',
  'auth_client_jwt_not_provided' = 'auth_client_jwt_not_provided',

  // Auth Client Transport keys
  'auth_client_pub_key_and_message_not_match' = 'auth_client_pub_key_and_message_not_match',
  'auth_client_pub_key_and_message_expired' = 'auth_client_pub_key_and_message_expired',
  'auth_client_pub_key_and_message_signature_failed' = 'auth_client_pub_key_and_message_signature_failed',
  'auth_client_pub_key_not_found' = 'auth_client_pub_key_not_found',

  // Auth User's Permission
  'auth_user_not_allowed_to_perform_the_action' = 'auth_user_not_allowed_to_perform_the_action',

  'multisig_participant_not_found' = 'multisig_participant_not_found',

  // Wallet
  'wallet_not_found' = 'wallet_not_found',

  // Asset
  'asset_not_found' = 'asset_not_found',

  // Seedphrase
  'seedphrase_could_not_be_decrypted' = 'seedphrase_could_not_be_decrypted',

  // User
  'user_not_found' = 'user_not_found',

  // OTP
  'otp_code_invalid' = 'otp_code_invalid',
  'otp_code_expired' = 'otp_code_expired',

  // Merchant
  'merchant_not_found' = 'merchant_not_found',
}
