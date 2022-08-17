import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {PurchaseError, useIAP} from 'react-native-iap';

import {Box, Button, Heading, Row, State} from '../components';
import {contentContainerStyle, errorLog} from '../utils';

export const PurchaseHistory = () => {
  const {connected, purchaseHistory, getPurchaseHistory} = useIAP();

  const handleGetPurchaseHistory = async () => {
    try {
      await getPurchaseHistory();
    } catch (error) {
      if (error instanceof PurchaseError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleGetPurchaseHistory', error});
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={contentContainerStyle}>
      <State connected={connected} />

      <Box>
        <View style={styles.container}>
          <Heading copy="Purchase histories" />

          {purchaseHistory.map((purchase, index) => (
            <Row
              key={purchase.productId}
              fields={[
                {
                  label: 'Product Id',
                  value: purchase.productId,
                },
              ]}
              isLast={purchaseHistory.length - 1 === index}
            />
          ))}
        </View>

        <Button
          title="Get the purchase histories"
          onPress={handleGetPurchaseHistory}
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
