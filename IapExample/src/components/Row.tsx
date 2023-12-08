import React, {ReactNode} from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import camelCase from 'lodash/camelCase';

import {theme} from '../utils';

interface RowField {
  label: string;
  value: string;
}

interface RowProps {
  children?: ReactNode;
  fields: RowField[];
  flexDirection?: ViewStyle['flexDirection'];
  isLast?: boolean;
}

export const Row = ({
  children,
  fields,
  flexDirection = 'row',
  isLast,
}: RowProps) => (
  <View style={[theme.row, isLast && theme.rowLast, {flexDirection}]}>
    <View>
      {fields.map((field, index) => (
        <View
          style={[styles.row, fields.length - 1 === index && styles.rowLast]}
          key={camelCase(field.label)}>
          <Text style={theme.L1}>{field.label}</Text>
          <Text style={theme.P1}>{field.value}</Text>
        </View>
      ))}
    </View>

    {children}
  </View>
);

const styles = StyleSheet.create({
  row: {
    marginBottom: 10,
  },

  rowLast: {
    marginBottom: 0,
  },
});
