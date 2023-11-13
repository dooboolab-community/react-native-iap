import React, {Component} from 'react';
import {
  Alert,
  EmitterSubscription,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  clearTransactionIOS,
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getAvailablePurchases,
  getProducts,
  getSubscriptions,
  initConnection,
  Product,
  ProductPurchase,
  promotedProductListener,
  PurchaseError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  requestSubscription,
  Sku,
  Subscription,
  SubscriptionPurchase,
} from 'react-native-iap';

import {Box, Button, Heading, Row} from '../components';
import {
  constants,
  contentContainerStyle,
  errorLog,
  isAndroid,
  theme,
} from '../utils';

interface State {
  productList: (Product | Subscription)[];
  receipt: string;
  availableItemsMessage: string;
}

export class ClassSetup extends Component<{}, State> {
  private purchaseUpdate: EmitterSubscription | null = null;
  private purchaseError: EmitterSubscription | null = null;
  private promotedProduct: EmitterSubscription | null = null;

  constructor(props: {}) {
    super(props);

    this.state = {
      productList: [],
      receipt: '',
      availableItemsMessage: '',
    };
  }

  async componentDidMount() {
    try {
      await initConnection();

      if (isAndroid) {
        await flushFailedPurchasesCachedAsPendingAndroid();
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
        await clearTransactionIOS();
      }
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({
          message: `[${(error as PurchaseError).code}]: ${
            (error as PurchaseError).message
          }`,
          error,
        });
      } else {
        errorLog({message: 'finishTransaction', error});
      }
    }

    this.purchaseUpdate = purchaseUpdatedListener(
      async (purchase: ProductPurchase | SubscriptionPurchase) => {
        const receipt = purchase.transactionReceipt
          ? purchase.transactionReceipt
          : (purchase as unknown as {originalJson: string}).originalJson;

        if (receipt) {
          try {
            const acknowledgeResult = await finishTransaction({purchase});

            console.info('acknowledgeResult', acknowledgeResult);
          } catch (error) {
            errorLog({message: 'finishTransaction', error});
          }

          this.setState({receipt}, () => this.goNext());
        }
      },
    ) as unknown as EmitterSubscription;

    this.purchaseError = purchaseErrorListener((error: PurchaseError) => {
      Alert.alert('purchase error', JSON.stringify(error));
    }) as unknown as EmitterSubscription;;

    this.promotedProduct = promotedProductListener((productId?: string) =>
      Alert.alert('Product promoted', productId),
    )  as unknown as EmitterSubscription;;
  }
  componentWillUnmount() {
    this.purchaseUpdate?.remove();
    this.purchaseError?.remove();
    this.promotedProduct?.remove();

    endConnection();
  }

  goNext = () => {
    Alert.alert('Receipt', this.state.receipt);
  };

  getItems = async () => {
    try {
      const products = await getProducts({skus: constants.productSkus});

      this.setState({productList: products});
    } catch (error) {
      errorLog({message: 'getItems', error});
    }
  };

  getSubscriptions = async () => {
    try {
      const products = await getSubscriptions({
        skus: constants.subscriptionSkus,
      });

      this.setState({productList: products});
    } catch (error) {
      errorLog({message: 'getSubscriptions', error});
    }
  };

  getAvailablePurchases = async () => {
    try {
      const purchases = await getAvailablePurchases();

      if (purchases?.length > 0) {
        this.setState({
          availableItemsMessage: `Got ${purchases.length} items.`,
          receipt: purchases[0]!.transactionReceipt,
        });
      }
    } catch (error) {
      errorLog({message: 'getAvailablePurchases', error});
    }
  };

  purchase = async (sku: Sku) => {
    try {
      requestPurchase({sku});
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({
          message: `[${(error as PurchaseError).code}]: ${
            (error as PurchaseError).message
          }`,
          error,
        });
      } else {
        errorLog({message: 'requestPurchase', error});
      }
    }
  };

  subscribe = async (sku: Sku) => {
    try {
      requestSubscription({sku});
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({
          message: `[${(error as PurchaseError).code}]: ${
            (error as PurchaseError).message
          }`,
          error,
        });
      } else {
        errorLog({message: 'requestSubscription', error});
      }
    }
  };

  render() {
    const {productList, receipt, availableItemsMessage} = this.state;
    const receipt100 = receipt.substring(0, 100);

    return (
      <ScrollView contentContainerStyle={contentContainerStyle}>
        <Box>
          <View style={styles.container}>
            <Heading copy="Products" />

            {productList.map((product, index) => (
              <Row
                key={product.productId}
                fields={[
                  {
                    label: 'Product JSON',
                    value: JSON.stringify(product, null, 2),
                  },
                ]}
                flexDirection="column"
                isLast={productList.length - 1 === index}
              >
                <Button
                  title="Buy"
                  onPress={() => this.subscribe(product.productId)}
                />
              </Row>
            ))}
          </View>

          <Button
            title={`Get Products (${productList.length})`}
            onPress={() => this.getItems()}
          />
        </Box>

        <Box>
          <View style={styles.container}>
            <Heading copy="Available purchases" />
          </View>

          {availableItemsMessage && (
            <Text style={theme.H2}>{availableItemsMessage}</Text>
          )}

          {receipt100 && <Text style={theme.P1}>{receipt100}</Text>}

          <Button
            title="Get available purchases"
            onPress={this.getAvailablePurchases}
          />
        </Box>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
