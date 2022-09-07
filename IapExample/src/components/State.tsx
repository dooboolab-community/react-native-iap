import React from 'react';
import {Text} from 'react-native';

import {theme} from '../utils';

import {Box} from './Box';

interface StateProps {
  connected: boolean;
  storekit2?: boolean;
}

export const State = ({connected, storekit2}: StateProps) => {
  const stateText =
    (connected ? 'connected' : 'not connected') +
    (storekit2 ? ' | Storekit 2' : '');
  return (
    <Box>
      <Text style={theme.L1}>State</Text>
      <Text style={theme.P1}>{stateText}</Text>
    </Box>
  );
};
