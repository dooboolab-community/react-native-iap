import React from 'react';
import {
  Pressable,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import lowerCase from 'lodash/lowerCase';
import upperFirst from 'lodash/upperFirst';

import {examples, Screens} from '../navigators';
import {colors, theme} from '../utils';

interface SectionData {
  name: keyof Screens;
  label?: string;
  component: JSX.Element;
  color: string;
  emoji: string;
}

interface ReducedData {
  section: string;
  data: SectionData[];
}

export const Examples = () => {
  const {navigate} = useNavigation<StackNavigationProp<Screens, 'Examples'>>();
  const data = examples.reduce<ReducedData[]>((acc, cur) => {
    const sectionFound = acc.find(({section}) => section === cur.section);

    if (sectionFound) {
      // @ts-ignore
      sectionFound.data.push(cur);
    } else {
      // @ts-ignore
      acc.push({section: cur.section, data: [cur]});
    }

    return acc;
  }, []);

  const renderItem: SectionListRenderItem<SectionData, ReducedData> = ({
    item,
  }) => (
    <Pressable onPress={() => navigate(item.name)}>
      <View style={styles.row}>
        {item.emoji && <Text>{item.emoji}</Text>}

        <Text style={[styles.rowTitle, {color: item.color}]}>
          {upperFirst(lowerCase(item.name))}
        </Text>

        {item.label && <Text style={styles.rowLabel}>{item.label}</Text>}
      </View>
    </Pressable>
  );

  const renderSection = ({
    section,
  }: {
    section: SectionListData<SectionData, ReducedData>;
  }) => (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionText}>{section.section}</Text>
    </View>
  );

  return (
    <SectionList
      sections={data}
      renderItem={renderItem}
      renderSectionHeader={renderSection}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
  },

  content: {
    paddingBottom: 32,
  },

  row: {
    backgroundColor: colors.white,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.gray200,
  },

  rowTitle: {
    ...theme.H3,
    marginTop: 4,
  },

  rowLabel: {
    ...theme.P2,
    marginTop: 4,
  },

  sectionRow: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.gray200,
  },

  sectionText: {
    ...theme.L1,
    color: '#454545',
  },
});
