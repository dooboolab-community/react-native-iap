import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import RNIap, {ProrationModesAndroid, Sku, useIAP} from 'react-native-iap';

import {Box, Button, Heading, Row, State} from '../components';
import {constants, contentContainerStyle, errorLog} from '../utils';

export const Subscriptions = () => {
  const {connected, subscriptions, getSubscriptions, requestSubscription} =
    useIAP();

  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions(constants.subscriptionSkus);
    } catch (error) {
      if (error instanceof RNIap.IapError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleGetSubscriptions', error});
      }
    }
  };

  const handleBuySubscription = async (sku: Sku) => {
    try {
      await requestSubscription({
        sku,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
        selectedOfferIndices: [0],
        prorationModeAndroid: ProrationModesAndroid.DEFERRED,
      });
    } catch (error) {
      if (error instanceof RNIap.IapError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleBuySubscription', error});
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={contentContainerStyle}>
      <State connected={connected} />

      <Box>
        <View style={styles.container}>
          <Heading copy="Subscriptions" />

          {subscriptions.map((subscription, index) => (
            <Row
              key={subscription.productId}
              fields={[
                {
                  label: 'Subscription Id',
                  value: subscription.productId,
                },
              ]}
              isLast={subscriptions.length - 1 === index}>
              <Button
                title="Buy"
                onPress={() => handleBuySubscription(subscription.productId)}
              />
            </Row>
          ))}
        </View>

        <Button
          title="Get the subscriptions"
          onPress={handleGetSubscriptions}
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
