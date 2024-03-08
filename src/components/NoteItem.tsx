import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { NoteI } from '../interfaces/note';
import { colorsDark } from '../constants/colors';

type Props = {
  item: NoteI;
  onPress: () => void
};

const NoteItem = ({ item, onPress }: Props) => {
  const createdAt = new Date(item.updatedAt);
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress()}>
      <View style={styles.containerLeft}>
        <Text style={styles.title}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.info}>
          {item.info}
        </Text>
      </View>
      <View style={styles.containerRight}>
        <Text>Updated At:</Text>
        <Text style={styles.date}>{createdAt.toLocaleDateString('en-US')}</Text>
        <Text style={styles.date}>
          {createdAt.getHours()}:{createdAt.getMinutes()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NoteItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 70,
    backgroundColor: colorsDark.secondary02,
    padding: 10,
    margin: 3,
    borderRadius: 20,
    zIndex: 99,
  },
  containerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colorsDark.text1,
  },
  info: {
    color: 'white',
    flexWrap: 'wrap',
  },
  containerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    fontWeight: '300',
  },
});
