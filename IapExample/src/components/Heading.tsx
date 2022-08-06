import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {borderRadius, colors, theme} from '../utils';

interface HeadingProps {
  copy: string;
  label?: string;
}

export const Heading = ({copy, label}: HeadingProps) => (
  <View style={styles.heading}>
    <Text style={theme.L1}>{copy}</Text>
    {label && <Text style={styles.label}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius - 2,
  },

  label: {
    ...theme.L1,
    color: colors.gray600,
  },
});
