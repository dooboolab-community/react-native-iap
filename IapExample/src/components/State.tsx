import React from 'react';
import {Text} from 'react-native';

import {theme} from '../utils';

import {Box} from './Box';

interface StateProps {
  connected: boolean;
}

export const State = ({connected}: StateProps) => (
  <Box>
    <Text style={theme.L1}>State</Text>
    <Text style={theme.P1}>{connected ? 'connected' : 'not connected'}</Text>
  </Box>
);
