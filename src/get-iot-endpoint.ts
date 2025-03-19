import { execSync } from 'child_process';

/**
 * AWS IoT Core エンドポイントを取得するスクリプト
 * 
 * 前提条件:
 * - AWS CLIがインストールされていること
 * - AWS CLIが設定されていること（aws configure）
 * 
 * 使用方法:
 * $ npx ts-node src/get-iot-endpoint.ts
 */

try {
  // AWS CLIを使用してIoT Coreのエンドポイントを取得
  const endpoint = execSync('aws iot describe-endpoint --endpoint-type iot:Data-ATS')
    .toString()
    .trim();
  
  // JSONをパースしてエンドポイントを取得
  const endpointData = JSON.parse(endpoint);
  const endpointAddress = endpointData.endpointAddress;
  
  console.log('AWS IoT Core エンドポイント:');
  console.log(endpointAddress);
  console.log('\nmqtt-publisher.tsの設定を以下のように更新してください:');
  console.log(`host: '${endpointAddress}',`);
} catch (error) {
  console.error('エラーが発生しました:', error);
  console.error('\nAWS CLIがインストールされ、設定されていることを確認してください。');
  console.error('$ aws configure');
  process.exit(1);
}
