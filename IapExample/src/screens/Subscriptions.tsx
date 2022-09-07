import React, {useEffect, useState} from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  isIosStorekit2,
  PurchaseError,
  requestSubscription,
  useIAP,
} from 'react-native-iap';

import {Box, Button, Heading, Row, State} from '../components';
import {constants, contentContainerStyle, errorLog} from '../utils';

export const Subscriptions = () => {
  const {
    connected,
    subscriptions,
    getSubscriptions,
    currentPurchase,
    finishTransaction,
  } = useIAP();
  const [ownedSubscriptions, setOwnedSubscriptions] = useState(new Set());
  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions({skus: constants.subscriptionSkus});
    } catch (error) {
      errorLog({message: 'handleGetSubscriptions', error});
    }
  };

  const handleBuySubscription = async (
    productId: string,
    offerToken?: string,
  ) => {
    if (Platform.OS === 'android' && !offerToken) {
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
      if (error instanceof PurchaseError) {
        errorLog({message: `[${error.code}]: ${error.message}`, error});
      } else {
        errorLog({message: 'handleBuySubscription', error});
      }
    }
  };

  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.transactionId) {
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });

          setOwnedSubscriptions(
            (prev) => new Set([...prev, currentPurchase?.productId]),
          );
        }
      } catch (error) {
        if (error instanceof PurchaseError) {
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
      <State connected={connected} storekit2={isIosStorekit2()} />

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
                {
                  label: 'type',
                  value: subscription.type,
                },
              ]}
              isLast={subscriptions.length - 1 === index}
            >
              {ownedSubscriptions.has(subscription.productId) && (
                <Text>Subscribed</Text>
              )}
              {!ownedSubscriptions.has(subscription.productId) &&
                Platform.OS === 'android' &&
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
              {!ownedSubscriptions.has(subscription.productId) &&
                Platform.OS === 'ios' && (
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
