import React from 'react';
import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import RNIap, {useIAP} from 'react-native-iap';

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

  const handleBuySubscription = async (
    productId: string,
    offerToken?: string,
  ) => {
    if (!offerToken) {
      console.warn(
        `There are no subscription Offers for selected product (Only requiered for Google Play purchases): ${productId}`,
      );
    }
    try {
      await requestSubscription({
        sku: productId,
        ...(offerToken && {
          subscriptionOffers: [{sku: productId, offerToken}],
        }),
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
              isLast={subscriptions.length - 1 === index}
            >
              {Platform.OS === 'android' &&
                // On Google Play Billing V5 you might have  multiple offers for a single sku
                subscription?.subscriptionOfferDetails?.map((offer) => (
                  <Button
                    title={`Subscribe ${offer.pricingPhases.pricingPhaseList
                      .map((ppl) => ppl.billingPeriod)
                      .join(',')}`}
                    onPress={() => {
                      handleBuySubscription(
                        subscription.productId,
                        offer.offerToken,
                      );
                    }}
                  />
                ))}
              {Platform.OS === 'ios' && (
                <Button
                  title="Subscribe"
                  onPress={() => {
                    handleBuySubscription(subscription.productId);
                  }}
                />
              )}
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
