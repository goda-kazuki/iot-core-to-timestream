import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as iot from 'aws-cdk-lib/aws-iot';
import * as timestream from 'aws-cdk-lib/aws-timestream';

export class IotCoreToTimestreamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // データベースとテーブルの名前を定数として定義
    const databaseName = 'iot_timestream_db';
    const tableName = 'iot_data';

    // Timestream データベースを作成 (L1コンストラクト - L2が完全に実装されていないため)
    const database = new timestream.CfnDatabase(this, 'IoTDatabase', {
      databaseName,
    });

    // Timestream テーブルを作成 (L1コンストラクト - L2が完全に実装されていないため)
    const table = new timestream.CfnTable(this, 'IoTDataTable', {
      databaseName,
      tableName,
      retentionProperties: {
        memoryStoreRetentionPeriodInHours: '24',
        magneticStoreRetentionPeriodInDays: '7',
      },
    });
    
    // データベースが作成された後にテーブルを作成するための依存関係を追加
    table.addDependency(database);

    // IoT Core から Timestream にデータを書き込むための IAM ロールを作成 (L2コンストラクト)
    const timestreamRole = new iam.Role(this, 'IoTTimestreamRole', {
      assumedBy: new iam.ServicePrincipal('iot.amazonaws.com'),
      description: 'Role for IoT Core to write to Timestream',
    });

    // Timestream へのアクセス権限を付与 (L2コンストラクト)
    timestreamRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['timestream:WriteRecords'],
        resources: [`arn:aws:timestream:${this.region}:${this.account}:database/${databaseName}/table/${tableName}`],
      })
    );
    
    timestreamRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['timestream:DescribeEndpoints'],
        resources: ['*'],
      })
    );
    
    // IoT Core トピックルールを作成 (L1コンストラクト - Timestreamアクションに対するL2サポートが限定的なため)
    const topicRule = new iot.CfnTopicRule(this, 'IoTToTimestreamRule', {
      ruleName: 'IoTToTimestreamRule',
      topicRulePayload: {
        sql: "SELECT * FROM 'iot/devices/+/data'",
        actions: [
          {
            timestream: {
              databaseName: databaseName,
              tableName: tableName,
              dimensions: [
                {
                  name: 'device_id',
                  value: '${topic(3)}', // トピックの3番目の部分をdevice_idとして使用
                },
                {
                  name: 'message_type',
                  value: '${topic(4)}', // トピックの4番目の部分をmessage_typeとして使用
                },
              ],
              roleArn: timestreamRole.roleArn,
              timestamp: {
                unit: 'MILLISECONDS',
                value: '${timestamp()}',
              },
            },
          },
        ],
        awsIotSqlVersion: '2016-03-23',
        ruleDisabled: false,
      },
    });

    // IoT Core ポリシーを作成（検証用に広い許可を持つポリシー）
    const iotPolicy = new iot.CfnPolicy(this, 'IoTDevicePolicy', {
      policyName: 'IoTDevicePolicy',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'iot:Connect',
              'iot:Publish',
              'iot:Subscribe',
              'iot:Receive',
            ],
            Resource: '*',
          },
        ],
      },
    });

    // 出力 (L2コンストラクト)
    new cdk.CfnOutput(this, 'TimestreamDatabaseName', {
      value: databaseName,
      description: 'Timestream Database Name',
    });

    new cdk.CfnOutput(this, 'TimestreamTableName', {
      value: tableName,
      description: 'Timestream Table Name',
    });

    new cdk.CfnOutput(this, 'IoTRuleName', {
      value: topicRule.ref,
      description: 'IoT Core Rule Name',
    });

    new cdk.CfnOutput(this, 'IoTPolicyName', {
      value: iotPolicy.ref,
      description: 'IoT Core Policy Name',
    });
  }
}
