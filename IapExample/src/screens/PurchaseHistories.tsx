import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import RNIap, {useIAP} from 'react-native-iap';

import {Box, Button, Heading, Row, State} from '../components';
import {contentContainerStyle, errorLog} from '../utils';

export const PurchaseHistories = () => {
  const {connected, purchaseHistories, getPurchaseHistories} = useIAP();

  const handleGetPurchaseHistories = async () => {
    try {
      await getPurchaseHistories();
    } catch (error) {
      if (error instanceof RNIap.IapError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleGetPurchaseHistories', error});
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={contentContainerStyle}>
      <State connected={connected} />

      <Box>
        <View style={styles.container}>
          <Heading copy="Purchase histories" />

          {purchaseHistories.map((purchaseHistory, index) => (
            <Row
              key={purchaseHistory.productId}
              fields={[
                {
                  label: 'Product Id',
                  value: purchaseHistory.productId,
                },
              ]}
              isLast={purchaseHistories.length - 1 === index}
            />
          ))}
        </View>

        <Button
          title="Get the purchase histories"
          onPress={handleGetPurchaseHistories}
        />
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
