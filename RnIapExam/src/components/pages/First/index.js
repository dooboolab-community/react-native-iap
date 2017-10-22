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
      items: [
        {
          name: 'BUY 1,000P',
          price: 1000,
        },
        {
          name: 'BUY 5,000P',
          price: 5000,
        },
        {
          name: 'BUY 10,000P',
          price: 10000,
        },
        {
          name: 'BUY 20,000P',
          price: 20000,
        },
      ],
    };
  }

  onIAPTest = (item) => {
    console.log('onIAPTest');
    console.log(item);
  }

  render() {
    return (
      <View style={ styles.container }>
        <View style={ styles.header }>
          <Navbar>IAP Example</Navbar>
        </View>
        <View style={ styles.content }>
        {
          this.state.items.map((item) => {
            return (
              <NativeButton
                key={item.name}
                onPress={() => this.onIAPTest(item)}
                activeOpacity={0.5}
                style={styles.btnIAP}
                textStyle={styles.txtIAP}
              >{item.name}</NativeButton>
            );
          })
        }
        </View>
      </View>
    );
  }
}

export default Page;
