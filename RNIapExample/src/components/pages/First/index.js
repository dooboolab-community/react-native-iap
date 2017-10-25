import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  NativeModules,
} from 'react-native';

import NativeButton from 'apsl-react-native-button';

import Navbar from '../../shared/Navbar';
import styles from './styles';
const { RNIapModule } = NativeModules;

const itemSkus = [
  'point_1000',
  '5000_point',
  '10000_point',
];

class Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount = () => {
    RNIapModule.prepare();
    RNIapModule.setConsumableMode('NOT_CONSUMABLE'); // CONSUMABLE & NOT_CONSUMABLE
  }

  getItems = () => {
    RNIapModule.getItems(
      JSON.stringify(itemSkus),
      (err, items) => {
        if (err) {
          console.log('err');
          console.log(err);
          return;
        }
        const parsedItems = JSON.parse(items);
        console.log(parsedItems);
      }
    );
  }

  getOwnedItems = () => {
    RNIapModule.getOwnedItems(
      (err, items) => {
        if (err) {
          console.log('err');
          console.log(err);
          return;
        }
        const parsedItems = JSON.parse(items);
        console.log(parsedItems);
      }
    );
  }

  buyItem = (sku) => {
    switch (sku) {
      case '1000':
        RNIapModule.buyItem('point_' + sku, (success) => {
          console.log('success');
          console.log(success);
        });
        break;
      case '5000':
        RNIapModule.buyItem(sku + '_point', (success) => {
          console.log('success');
          console.log(success);
        });
        break;
    }
  }

  consumeItem = (token) => {
    switch (token) {
      case '1000':
        break;
      case '5000':
        break;
    }
  }

  render() {
    return (
      <View style={ styles.container }>
        <View style={ styles.header }>
          <Navbar>react-native-iap</Navbar>
        </View>
        <View style={ styles.content }>
          <NativeButton
            onPress={() => this.getItems()}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Get Items</NativeButton>
          <NativeButton
            onPress={() => this.getOwnedItems()}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Get Purchased Items</NativeButton>
          <NativeButton
            onPress={() => this.buyItem('1000')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Buy P1000</NativeButton>
          <NativeButton
            onPress={() => this.buyItem('5000')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Buy P2000</NativeButton>
          <NativeButton
            onPress={() => this.consumeItem('1000')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Consume P1000</NativeButton>
          <NativeButton
            onPress={() => this.consumeItem('5000')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Consume P2000</NativeButton>
        </View>
      </View>
    );
  }
}

export default Page;
