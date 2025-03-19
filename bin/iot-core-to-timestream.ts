#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IotCoreToTimestreamStack } from '../lib/iot-core-to-timestream-stack';

const app = new cdk.App();
new IotCoreToTimestreamStack(app, 'IotCoreToTimestreamStack', {
  /* スタックに必要なプロパティがあればここに追加 */
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
});
