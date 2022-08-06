import React, {Component} from 'react';
import {
  Alert,
  Button as NativeButton,
  EmitterSubscription,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNIap, {
  InAppPurchase,
  Product,
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
} from 'react-native-iap';

type Props = Record<string, never>;

interface State {
  productList: (Product | Subscription)[];
  receipt: string;
  availableItemsMessage: string;
}

const itemSkus = Platform.select({
  ios: [
    'com.cooni.point1000',
    'com.cooni.point5000', // dooboolab
  ],

  android: [
    'android.test.purchased',
    'android.test.canceled',
    'android.test.refunded',
    'android.test.item_unavailable',
    // 'point_1000', '5000_point', // dooboolab
  ],

  default: [],
}) as string[];

const itemSubs = Platform.select({
  ios: [
    'com.cooni.point1000',
    'com.cooni.point5000', // dooboolab
  ],

  android: [
    'test.sub1', // subscription
  ],

  default: [],
}) as string[];

class RNIapPurchaseError implements PurchaseError {
  constructor(public code?: string, public message?: string) {
    this.code = code;
    this.message = message;
  }
}

export class App extends Component<Props, State> {
  private purchaseUpdateSubscription: EmitterSubscription | null = null;
  private purchaseErrorSubscription: EmitterSubscription | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      productList: [],
      receipt: '',
      availableItemsMessage: '',
    };
  }

  async componentDidMount() {
    try {
      await RNIap.initConnection();
      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      } else {
        /**
         * WARNING This line should not be included in production code
         * This call will call finishTransaction in all pending purchases
         * on every launch, effectively consuming purchases that you might
         * not have verified the receipt or given the consumer their product
         *
         * TL;DR you will no longer receive any updates from Apple on
         * every launch for pending purchases
         */
        await RNIap.clearTransactionIOS();
      }
    } catch (error) {
      if (error instanceof RNIapPurchaseError) {
        console.warn(error.code, error.message);
      }
    }

    this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase: InAppPurchase | SubscriptionPurchase) => {
        console.info('purchase', purchase);
        const receipt = purchase.transactionReceipt
          ? purchase.transactionReceipt
          : (purchase as unknown as {originalJson: string}).originalJson;
        console.info(receipt);
        if (receipt) {
          try {
            const ackResult = await RNIap.finishTransaction(purchase);
            console.info('ackResult', ackResult);
          } catch (error) {
            console.warn('error', error);
          }
          this.setState({receipt}, () => this.goNext());
        }
      },
    );

    this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error: RNIapPurchaseError) => {
        console.log('purchaseErrorListener', error);
        Alert.alert('purchase error', JSON.stringify(error));
      },
    );
  }

  componentWillUnmount() {
    this.purchaseUpdateSubscription?.remove();
    this.purchaseErrorSubscription?.remove();
    RNIap.endConnection();
  }

  goNext = () => {
    Alert.alert('Receipt', this.state.receipt);
  };

  getItems = async () => {
    try {
      const products = await RNIap.getProducts(itemSkus);
      console.log('Products', products);

      this.setState({productList: products});
    } catch (error) {
      if (error instanceof RNIapPurchaseError) {
        console.warn(error.code, error.message);
      }
    }
  };

  getSubscriptions = async () => {
    try {
      const products = await RNIap.getSubscriptions(itemSubs);
      console.log('Products', products);

      this.setState({productList: products});
    } catch (error) {
      if (error instanceof RNIapPurchaseError) {
        console.warn(error.code, error.message);
      }
    }
  };

  getAvailablePurchases = async () => {
    try {
      console.info(
        'Get available purchases (non-consumable or unconsumed consumable)',
      );

      const purchases = await RNIap.getAvailablePurchases();
      console.info('Available purchases :: ', purchases);

      if (purchases?.length > 0) {
        this.setState({
          availableItemsMessage: `Got ${purchases.length} items.`,
          receipt: purchases[0]!.transactionReceipt,
        });
      }
    } catch (error) {
      if (error instanceof RNIapPurchaseError) {
        console.warn(error.code, error.message);
        Alert.alert(error.message ?? '');
      }
    }
  };

  requestPurchase = async (sku: string) => {
    try {
      RNIap.requestPurchase({sku});
    } catch (error) {
      if (error instanceof RNIapPurchaseError) {
        console.warn(error.code, error.message);
      }
    }
  };

  requestSubscription = async (sku: string) => {
    try {
      RNIap.requestSubscription({sku});
    } catch (error) {
      if (error instanceof RNIapPurchaseError) {
        Alert.alert(error.message ?? '');
      }
    }
  };

  render() {
    const {productList, receipt, availableItemsMessage} = this.state;
    const receipt100 = receipt.substring(0, 100);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTxt}>react-native-iap</Text>
        </View>

        <View style={styles.content}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.spacer} />

            <NativeButton
              title="Get available purchases"
              onPress={this.getAvailablePurchases}
            />

            <Text style={styles.messageTitle}>{availableItemsMessage}</Text>
            <Text style={styles.messageCopy}>{receipt100}</Text>

            <NativeButton
              title={`Get Products (${productList.length})`}
              onPress={() => this.getItems()}
            />

            {productList.map((product, i) => (
              <View key={i} style={styles.productRow}>
                <Text style={styles.productText}>
                  {JSON.stringify(product)}
                </Text>

                <NativeButton
                  title="Request purchase for above product"
                  onPress={() => this.requestSubscription(product.productId)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.select({
      ios: 0,
      android: 24,
    }),
    paddingTop: Platform.select({
      ios: 0,
      android: 24,
    }),
    backgroundColor: 'white',
  },

  header: {
    flex: 20,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTxt: {
    fontSize: 26,
    color: 'green',
  },

  content: {
    flex: 80,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  scrollView: {
    alignSelf: 'stretch',
  },

  spacer: {
    height: 50,
  },

  messageTitle: {
    margin: 5,
    fontSize: 15,
    alignSelf: 'center',
  },

  messageCopy: {
    margin: 5,
    fontSize: 9,
    alignSelf: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  productRow: {
    flexDirection: 'column',
  },

  productText: {
    marginTop: 20,
    fontSize: 12,
    color: 'black',
    minHeight: 100,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
});
