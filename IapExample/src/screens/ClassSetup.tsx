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
  endConnection,
  finishTransaction,
  flushFailedPurchasesCachedAsPendingAndroid,
  getAvailablePurchases,
  getProducts,
  getSubscriptions,
  initConnection,
  Product,
  ProductPurchase,
  PurchaseError,
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
      }
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
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
    );
  }

  componentWillUnmount() {
    this.purchaseUpdate?.remove();

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

  requestPurchase = async (sku: Sku) => {
    try {
      requestPurchase({sku});
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'requestPurchase', error});
      }
    }
  };

  requestSubscription = async (sku: Sku) => {
    try {
      requestSubscription({sku});
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
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
                key={product.id}
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
                  onPress={() => this.requestSubscription(product.id)}
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
