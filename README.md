# IoT Core to Timestream

AWS IoT Core から Amazon Timestream へのデータ転送を実現する AWS CDK プロジェクト。

## アーキテクチャ

このプロジェクトは以下の AWS リソースを作成します：

1. **Amazon Timestream データベースとテーブル** - IoT デバイスから送信されたデータを保存するための時系列データベース
2. **AWS IoT Core トピックルール** - 特定のトピックに送信されたメッセージを処理するためのルール
3. **IAM ロール** - IoT Core が Timestream にデータを書き込むための権限を付与

## 前提条件

- AWS CLI がインストールされ、設定されていること
- Node.js 14.x 以上
- AWS CDK v2

## セットアップ

```bash
# 依存関係をインストール
npm install

# TypeScriptをコンパイル
npm run build

# CDKアプリケーションをブートストラップ（初回のみ）
npx cdk bootstrap

# CloudFormationテンプレートを合成
npm run synth

# スタックをデプロイ
npm run deploy
```

## 使用方法

デプロイ後、IoT デバイスは以下のトピックにデータを送信できます：

```
iot/devices/{device_id}/data
```

ここで、`{device_id}` はデバイスの一意の識別子です。

送信されたデータは自動的に Timestream データベースに保存されます。各レコードには以下のディメンションが含まれます：

- `device_id`: デバイスの識別子（トピックから抽出）
- `message_type`: メッセージのタイプ（トピックから抽出）

## カスタマイズ

`lib/iot-core-to-timestream-stack.ts` ファイルを編集して、以下をカスタマイズできます：

- Timestream データベースとテーブルの名前
- データ保持期間
- IoT トピックルールの SQL クエリ
- ディメンションの定義

## クリーンアップ

```bash
npx cdk destroy
```

### モノを作成

```sh
aws iot  create-thing --thing-name IoTCoreToTimestreamDevice
```

### 証明書を作成

```sh
aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile "certificate.pem" --public-key-outfile "publicKey.pem" --private-key-outfile "privateKey.pem"
```

### 証明書にポリシーをアタッチ

```sh
aws iot attach-policy --policy-name IoTDevicePolicy --target {前項のレスポンスであった証明書の Arn}
```

### モノに証明書をアタッチ

```sh
aws iot attach-thing-principal --thing-name IoTCoreToTimestreamDevice --principal {前項のレスポンスであった証明書の Arn}
```
