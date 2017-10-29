import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  NativeModules,
} from 'react-native';
import NativeButton from 'apsl-react-native-button';
import RNIap from 'react-native-iap';

import Navbar from '../../shared/Navbar';
import styles from './styles';
// const { RNIapModule } = NativeModules;

const itemSkus = [
  'com.cooni.point1000',
  'com.cooni.point5000',
];

const someSkus = ['react.iap.consum.500', 'react.iap.consum.1000'];

class Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productList: [], receipt: 'receipt',
    };
  }

  // componentDidMount = () => {
  //   RNIapModule.prepare();
  //   // this usually needed for debug
  //   RNIapModule.refreshPurchaseItems();
  // }

  // getItems = () => {
  //   RNIapModule.getItems(
  //     JSON.stringify(itemSkus),
  //     (err, items) => {
  //       if (err) {
  //         console.log('err');
  //         console.log(err);
  //         return;
  //       }
  //       const parsedItems = JSON.parse(items);
  //       console.log(parsedItems);
  //     }
  //   );
  // }

  async getItems() {
    try {
      // const items = await RNIap.getItems(someSkus); itemSkus
      const items = await RNIap.getItems(itemSkus);
      console.log(typeof items, items, Object.keys(items), '  in Array :: ', Object.values(items));
      this.setState({ productList: Object.values(items)});
    } catch (err) {
      console.log(`${err}`);
      Alert.alert(`${err}`);
    }
  }


  // getOwnedItems = () => {
  //   RNIapModule.getOwnedItems(
  //     (err, items) => {
  //       if (err) {
  //         console.log('err');
  //         console.log(err);
  //         return;
  //       }
  //       const parsedItems = JSON.parse(items);
  //       console.log(parsedItems);
  //     }
  //   );
  // }
  async buyItem(sku) {
    try {
      const items = await RNIap.buyItem(sku);
      // ios case parsing  리턴값이 어레이가 아님...  0, 1 를 키로 갖는 객체임..
      console.log(receipt);
      this.setState({ receipt });
    } catch (err) {
      console.log(`${err}`);
      Alert.alert(`${err}`);
    }
  }

  // buyItem = (sku) => {
  //   let parsedItem = {};
  //   switch (sku) {
  //     case '1000':
  //       RNIapModule.buyItem('point_' + sku, (err, item) => {
  //         parsedItem = JSON.parse(item);
  //         console.log('parsedItem');
  //         console.log(parsedItem);
  //       });
  //       break;
  //     case '5000':
  //       RNIapModule.buyItem(sku + '_point', (err, item) => {
  //         parsedItem = JSON.parse(item);
  //         console.log('parsedItem');
  //         console.log(parsedItem);
  //       });
  //       break;
  //     case 'TEST':
  //       RNIapModule.buyItem('android.test.purchased', (err, item) => {
  //         parsedItem = JSON.parse(item);
  //         console.log('parsedItem');
  //         console.log(parsedItem);
  //         RNIapModule.consumeItem(parsedItem.purchaseToken, (err, success) => {
  //           console.log('consume');
  //           console.log(success);
  //         });
  //       });
  //       break;
  //   }
  // }

  consumeItem = (token) => {
    switch (token) {
      case '1000':
        break;
      case '5000':
        break;
    }
  }

  render() {
    const { productList, receipt } = this.state;
    const receipt100 = receipt.substring(0, 100);

    return (
      <View style={ styles.container }>
        <View style={ styles.header }>
          <Navbar>react-native-iap</Navbar>
        </View>
        <View style={ styles.content }>
          <NativeButton
            onPress={async () => this.getItems()}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Get Items {productList.length}</NativeButton>
          <NativeButton
            onPress={() => this.getOwnedItems()}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Get Purchased Items</NativeButton>
          <Text style={{ fontSize: 4 }} >{receipt100}</Text>
          <NativeButton
            onPress={async () => this.buyItem('com.cooni.point1000')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Buy P1000</NativeButton>
          <NativeButton
            onPress={() => this.buyItem('com.cooni.point5000')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Buy P5000</NativeButton>
          <NativeButton
            onPress={() => this.buyItem('TEST')}
            activeOpacity={0.5}
            style={styles.btn}
            textStyle={styles.txt}
          >Buy TEST</NativeButton>
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
