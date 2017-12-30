import React, { Component } from 'react';
import {
  View,
  Text,
  Alert,
  NativeModules,
  Platform,
  ScrollView,
} from 'react-native';
import NativeButton from 'apsl-react-native-button';
import RNIap from 'react-native-iap';

import Navbar from '../shared/Navbar';
import EStyleSheet from 'react-native-extended-stylesheet';

// App Bundle > com.dooboolab.test

const itemSkus = {
  ios: [
    'auto.subscript.mtt.iap', 'react.iap.consum.1000', 'react.iap.consum.500', // JWMoon
    // 'com.cooni.point1000', 'com.cooni.point5000', // dooboolab
  ],
  android: [
    'point_1000',
    '5000_point',
  ],
};

class Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productList: [],
      receipt: '',
    };
  }

  async componentDidMount(){
    if (Platform.OS === 'android') {
      const msg = await RNIap.prepareAndroid();
      console.log('msg: ' + msg);
    }
  }

  goToNext = () => {
    this.props.navigation.navigate('Second', {
      receipt: this.state.receipt,
    });
  }

  getItems = async() =>{
    try {
      // const items = await RNIap.getItems(someSkus); itemSkus
      const items = await RNIap.getItems(itemSkus);
      // console.log('items: ' + typeof (items));
      console.log('getItems');
      console.log(items); // , JSON.stringify(items));
      // [ {price: 2.19, productId: "react.iap.consum.1000"},   //   iOS result...
      //   {price: 1.09, productId: "react.iap.consum.500"}  ]
      this.setState({ productList: items });
    } catch (err) {
      console.log('err');
      console.log(err);
    }
  }

  buyItem = async(sku) => {
    try {
      console.log('buyItem: ' + sku);
      const receipt = await RNIap.buyItem(sku);
      // ios case parsing  리턴값이 어레이가 아님...  0, 1 를 키로 갖는 객체임..
      console.log(receipt);
      this.setState({ receipt }, () => this.goToNext());
    } catch (err) {
      console.log(`${err}`);
      Alert.alert(`${err}`);
    }
  }

  buySubscribeItem = async(sku) => {
    try {
      console.log('buyItem: ' + sku);
      const receipt = await RNIap.buyItem(sku);
      // ios case parsing  리턴값이 어레이가 아님...  0, 1 를 키로 갖는 객체임..
      console.log(receipt);
      this.setState({ receipt }, () => this.goToNext());
    } catch (err) {
      console.log(`${err}`);
      Alert.alert(`${err}`);
    }
  }

  fetchHistory = async() => {
    try {
      console.log('  fetch history ', RNIap);
      const rslts = await RNIap.fetchHistory();
      console.log(rslts);
    } catch(err) {
      console.log(`${err}`);
      Alert.alert(`${err}`);
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
          <ScrollView
            style={{ alignSelf: 'stretch' }}
          >
            <View style={{ height: 50 }} />
            <NativeButton
              onPress={this.fetchHistory}
              activeOpacity={0.5}
              style={styles.btn}
              textStyle={styles.txt}
            >Fetch Transactions</NativeButton>
            <NativeButton
              onPress={() => this.getItems()}
              activeOpacity={0.5}
              style={styles.btn}
              textStyle={styles.txt}
            >Get Items {productList.length}</NativeButton>
            {
              productList.map((product, i) => {
                return(
                  <View key={i} style={{
                    flexDirection: 'column',
                  }}>
                    <Text style={{
                      marginTop: 20,
                      fontSize: 12,
                      color: 'black',
                      alignSelf: 'center',
                    }} >{JSON.stringify(product)}</Text>
                    <NativeButton
                      onPress={() => this.buyItem(product.productId)}
                      activeOpacity={0.5}
                      style={styles.btn}
                      textStyle={styles.txt}
                    >Buy Above Item</NativeButton>
                  </View>
                )
              })
            }
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: Platform.OS === 'ios' ? 0 : '$statusSize',
    paddingTop: Platform.OS === 'ios' ? '$statusPaddingSize' : 0,
    backgroundColor: 'white',
  },
  header: {
    flex: 8.8,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 87.5,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  title: {
    fontSize: '$24',
    fontWeight: 'bold',
  },
  btn: {
    height: '$48',
    width: '240 * $ratio',
    alignSelf: 'center',
    backgroundColor: '#00c40f',
    borderRadius: 0,
    borderWidth: 0,
  },
  txt: {
    fontSize: '$fontSize',
    color: 'white',
  },
});

export default Page;
