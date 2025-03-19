import * as awsIot from 'aws-iot-device-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .envファイルから環境変数を読み込む
dotenv.config();


// 環境変数の存在確認
if (!process.env.AWS_IOT_ENDPOINT) {
  throw new Error('環境変数 AWS_IOT_ENDPOINT が設定されていません');
}

// 設定
const config = {
  // AWS IoT Core エンドポイント
  host: process.env.AWS_IOT_ENDPOINT,
  // 証明書ファイルのパス
  keyPath: path.join(__dirname, '../privateKey.pem'),
  certPath: path.join(__dirname, '../certificate.pem'),
  caPath: path.join(__dirname, '../rootCA.pem'), // AWSのルート証明書が必要な場合
  clientId: `iot-device-${Math.floor(Math.random() * 1000000)}`, // ランダムなクライアントID
  // トピック設定
  deviceId: 'device001', // デバイスID
  messageType: 'data', // メッセージタイプ
  // 送信間隔（ミリ秒）
  publishInterval: 5000,
};

// トピックを構築
const topic = `iot/devices/${config.deviceId}/${config.messageType}`;

// デバイスオブジェクトを作成
const device = awsIot.device({
  host: config.host,
  keyPath: config.keyPath,
  certPath: config.certPath,
  caPath: config.caPath,
  clientId: config.clientId,
});

// 接続イベントハンドラ
device.on('connect', () => {
  console.log('接続しました');
  console.log(`トピック: ${topic} にデータを送信します`);
  
  // 定期的にデータを送信
  setInterval(() => {
    publishData();
  }, config.publishInterval);
});

// エラーイベントハンドラ
device.on('error', (err: Error) => {
  console.error('エラーが発生しました:', err);
});

// 切断イベントハンドラ
device.on('close', () => {
  console.log('接続が閉じられました');
});

// オフラインイベントハンドラ
device.on('offline', () => {
  console.log('オフラインになりました');
});

// 再接続イベントハンドラ
device.on('reconnect', () => {
  console.log('再接続しています');
});

/**
 * センサーデータを生成して送信する関数
 */
function publishData(): void {
  // ダミーのセンサーデータを生成
  const data = {
    temperature: 20 + Math.random() * 10, // 20-30度のランダムな温度
    humidity: 40 + Math.random() * 20, // 40-60%のランダムな湿度
    pressure: 1000 + Math.random() * 20, // 1000-1020hPaのランダムな気圧
    timestamp: new Date().toISOString(),
  };

  console.log(`送信データ: ${JSON.stringify(data)}`);

  // データを送信
  device.publish(topic, JSON.stringify(data));
}

// メイン処理
console.log('IoT Core MQTT パブリッシャーを開始します...');
