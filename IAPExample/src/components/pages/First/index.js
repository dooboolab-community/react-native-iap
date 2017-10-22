import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
} from 'react-native';

import NativeButton from 'apsl-react-native-button';

import Navbar from '../../shared/Navbar';
import styles from './styles';

class Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isNaverLoggingin: false,
    };
  }

  onIAPTest = () => {
    console.log('onIAPTest');
  }

  render() {
    return (
      <View style={ styles.container }>
        <View style={ styles.header }>
          <Navbar>IAP Example</Navbar>
        </View>
        <View style={ styles.content }>
          <NativeButton
            isLoading={this.state.isNaverLoggingin}
            onPress={this.onIAPTest}
            activeOpacity={0.5}
            style={styles.btnIAP}
            textStyle={styles.txtIAP}
          >Test IAP</NativeButton>
        </View>
      </View>
    );
  }
}

export default Page;
