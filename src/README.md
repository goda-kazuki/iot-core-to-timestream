# MQTT IoT Core パブリッシャー

このプロジェクトは、AWS IoT Core に MQTT を使用してデータを送信する TypeScript プログラムです。

## 前提条件

- Node.js と npm がインストールされていること
- AWS アカウントと適切な権限
- AWS IoT Core で作成された証明書（certificate.pem、privateKey.pem）
- AWS CLI（エンドポイント取得用）

## セットアップ

1. 依存関係をインストールします：

```bash
npm install
```

2. AWS IoT Core エンドポイントを取得します：

```bash
npx ts-node src/get-iot-endpoint.ts
```

3. `src/mqtt-publisher.ts` ファイルを開き、以下の設定を更新します：

   - `host`: 上記コマンドで取得したエンドポイント(.env を参照します)
   - `deviceId`: 任意のデバイス ID
   - その他必要に応じて設定を変更

4. AWS IoT Core のルート証明書をダウンロードします（必要な場合）：

```bash
curl https://www.amazontrust.com/repository/AmazonRootCA1.pem > rootCA.pem
```

## 実行方法

```bash
npx ts-node src/mqtt-publisher.ts
```

## 送信データ

このプログラムは以下のようなダミーのセンサーデータを生成して送信します：

```json
{
  "temperature": 25.123,
  "humidity": 45.678,
  "pressure": 1010.456,
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## トピック構造

データは以下のトピックに送信されます：

```
iot/devices/{deviceId}/data
```

このトピック構造は、IoT Core のトピックルールと一致しており、Timestream にデータを保存するように設定されています。

## 注意事項

- 実際の環境で使用する前に、セキュリティ設定を適切に行ってください。
- 証明書ファイルは安全に管理してください。
- 本番環境では、エラーハンドリングやリトライロジックを追加することをお勧めします。
