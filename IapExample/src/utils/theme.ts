import {StyleSheet} from 'react-native';

export const contentContainerStyle = {paddingBottom: 40};

export const borderRadius = 8;

export const colors = {
  white: '#fff',
  dark: '#000',
  gray100: '#f0f0f0',
  gray200: '#e0e0e0',
  gray300: '#aaa',
  gray500: '#454545',
  gray600: '#212121',
  blue: '#3994d0',
  red: '#df4343',
  green: '#48c982',
};

export const theme = StyleSheet.create({
  /**
   * Headings
   */

  H2: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.gray600,
  },

  H3: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray500,
  },

  /**
   * Paragraphs
   */

  P1: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.dark,
  },

  P2: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.gray300,
  },

  /**
   * Labels
   */

  L1: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontWeight: '600',
    fontSize: 12,
    color: colors.gray300,
  },

  /**
   * Layouts
   */

  row: {
    marginTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  rowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },

  /**
   * Atoms
   */

  box: {
    margin: 20,
    marginBottom: 5,
    padding: 20,
    backgroundColor: colors.white,
    borderRadius,
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowOffset: {height: 16, width: 0},
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  button: {
    padding: 10,
    backgroundColor: colors.blue,
    borderRadius: borderRadius - 2,
  },
});
