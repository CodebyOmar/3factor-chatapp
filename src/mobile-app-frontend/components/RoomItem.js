import * as React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { withTheme } from 'react-native-paper';

let RoomItem = ({ onPressItem, id, name, selected, theme }) => {
  const { colors } = theme;

  return (
    <TouchableOpacity
      onPress={() => onPressItem(id)}
      style={[
        styles.roomBtn,
        {
          backgroundColor: selected ? '#ccc' : 'transparent',
        },
      ]}>
      <Text
        style={[styles.roomTitle, { color: selected ? '#fff' : colors.text }]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

let UserRoomItem = ({ onPressItem, roomsByroomId, selected, theme }) => {
  const { colors } = theme;
  const {id, name} = roomsByroomId;

  return (
    <TouchableOpacity
      onPress={() => onPressItem(id)}
      style={[
        styles.roomBtn,
        {
          backgroundColor: selected ? '#ccc' : 'transparent',
        },
      ]}>
      <Text
        style={[styles.roomTitle, { color: selected ? '#fff' : colors.text }]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roomTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 7,
  },
  roomBtn: {
    width: '100%',
    marginBottom: 5,
    borderRadius: 5,
  },
});

RoomItem = withTheme(RoomItem);
UserRoomItem = withTheme(UserRoomItem);
export {RoomItem, UserRoomItem};
