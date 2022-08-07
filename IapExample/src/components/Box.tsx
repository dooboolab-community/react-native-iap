import React, {ReactNode} from 'react';
import {View} from 'react-native';

import {theme} from '../utils';

interface BoxProps {
  children: ReactNode;
}

export const Box = ({children}: BoxProps) => (
  <View style={theme.box}>{children}</View>
);
