import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import RNIap, {Sku, useIAP} from 'react-native-iap';

import {Box, Button, Heading, Row, State} from '../components';
import {
  colors,
  constants,
  contentContainerStyle,
  errorLog,
  theme,
} from '../utils';

export const Products = () => {
  const [success, setSuccess] = useState(false);
  const {
    connected,
    products,
    promotedProductsIOS,
    currentPurchase,
    currentPurchaseError,
    initConnectionError,
    finishTransaction,
    getProducts,
    requestPurchase,
  } = useIAP();

  const handleGetProducts = async () => {
    try {
      await getProducts(constants.productSkus);
    } catch (error) {
      if (error instanceof RNIap.IapError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleGetProducts', error});
      }
    }
  };

  const handleBuyProduct = async (sku: Sku) => {
    try {
      await requestPurchase({sku});
    } catch (error) {
      if (error instanceof RNIap.IapError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleBuyProduct', error});
      }
    }
  };

  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.transactionReceipt) {
          await finishTransaction(currentPurchase, true);
          setSuccess(true);
        }
      } catch (error) {
        if (error instanceof RNIap.IapError) {
          errorLog({message: `[${error.code}]: ${error.message}`, error});
        } else {
          errorLog({message: 'handleBuyProduct', error});
        }
      }
    };

    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  return (
    <ScrollView contentContainerStyle={contentContainerStyle}>
      <State connected={connected} />

      {initConnectionError && (
        <Box>
          <Text style={styles.errorMessage}>
            An error happened while initiating the connection.
          </Text>
        </Box>
      )}

      {currentPurchaseError && (
        <Box>
          <Text style={styles.errorMessage}>
            code: {currentPurchaseError.code}, message:{' '}
            {currentPurchaseError.message}
          </Text>
        </Box>
      )}

      {success && (
        <Box>
          <Text style={styles.successMessage}>
            A product purchase has been processed successfully.
          </Text>
        </Box>
      )}

      <Box>
        <View style={styles.container}>
          <Heading copy="Products" />

          {products.map((product, index) => (
            <Row
              key={product.productId}
              fields={[
                {
                  label: 'Product Id',
                  value: product.productId,
                },
              ]}
              isLast={products.length - 1 === index}>
              <Button
                title="Buy"
                onPress={() => handleBuyProduct(product.productId)}
              />
            </Row>
          ))}
        </View>

        <Button title="Get the products" onPress={handleGetProducts} />
      </Box>

      <Box>
        <Heading copy="Promoted products" label="iOS only" />

        {promotedProductsIOS.map((product, index) => (
          <Row
            key={product.productId}
            fields={[
              {
                label: 'Product Id',
                value: product.productId,
              },
            ]}
            isLast={promotedProductsIOS.length - 1 === index}>
            <Button
              title="Buy a product"
              onPress={() => handleBuyProduct(product.productId)}
            />
          </Row>
        ))}
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  errorMessage: {
    ...theme.P1,
    color: colors.red,
  },

  successMessage: {
    ...theme.P1,
    colors: colors.green,
  },

  container: {
    marginBottom: 20,
  },
});
