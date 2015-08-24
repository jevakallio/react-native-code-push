/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

var RCTTestModule = require('NativeModules').TestModule;
var React = require('react-native');
var CodePushSdk = require('react-native-code-push');
var NativeBridge = require('react-native').NativeModules.CodePush;

var {
  Text,
  View,
} = React;

var NewUpdateTest = React.createClass({
  propTypes: {
    shouldThrow: React.PropTypes.bool,
    waitOneFrame: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      done: false,
    };
  },

  componentDidMount() {
    if (this.props.waitOneFrame) {
      requestAnimationFrame(this.runTest);
    } else {
      this.setUp(this.runTest);
    }
  },
  
  setUp(callWhenDone) {
    var mockAcquisitionSdk = {
      latestPackage: {
        downloadUrl: "http://www.windowsazure.com/blobs/awperoiuqpweru",
        description: "Angry flappy birds",
        appVersion: "1.5.0",
        label: "2.4.0",
        isMandatory: false,
        isAvailable: true,
        updateAppVersion: false,
        packageHash: "hash240",
        packageSize: 1024
      },
      queryUpdateWithCurrentPackage: function(queryPackage, callback){
        if (!this.latestPackage || queryPackage.appVersion !== this.latestPackage.appVersion ||
          queryPackage.packageHash == this.latestPackage.packageHash) {
          callback(/*err:*/ null, false);
        } else {
          callback(/*err:*/ null, this.latestPackage);
        } 
      }
    };
    
    var localPackage = JSON.stringify({
      downloadURL: "http://www.windowsazure.com/blobs/awperoiuqpweru",
      description: "Angry flappy birds",
      appVersion: "1.5.0",
      label: "2.4.0",
      isMandatory: false,
      isAvailable: true,
      updateAppVersion: false,
      packageHash: "hash123",
      packageSize: 1024
    });
    
    var mockConfiguration = { appVersion : "1.5.0" };
    NativeBridge.setUsingTestFolder(true);
    CodePushSdk.setUpTestDependencies(mockAcquisitionSdk, mockConfiguration, NativeBridge);
    
    NativeBridge.writeToLocalPackage(localPackage, function(err){
      if (err) {
        throw new Error('Setup: Error removing local package');
      } else {
        callWhenDone();
      }
    });
  },
  
  runTest() {
    CodePushSdk.queryUpdate((err, update) => {
      if (update) {
        this.setState({done: true}, RCTTestModule.markTestCompleted);
      } else if (err) {
        throw new Error(err.message);
      } else {
        throw new Error('SDK should return a package when there is a new update');
      }
    });
  },

  render() {
    return (
      <View style={{backgroundColor: 'white', padding: 40}}>
        <Text>
          {this.constructor.displayName + ': '}
          {this.state.done ? 'Done' : 'Testing...'}
        </Text>
      </View>
    );
  }
});

NewUpdateTest.displayName = 'NewUpdateTest';

module.exports = NewUpdateTest;