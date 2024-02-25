import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colorsDark } from '../constants/colors';
import NoteEditor from '../components/Modals/NoteEditor';

const HomeScreen = () => {
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowNoteEditor(true)}>
        <FeatherIcon name="plus" size={32} color={colorsDark.text1} />
      </TouchableOpacity>
      <NoteEditor
        mode="create"
        visible={showNoteEditor}
        setVisible={setShowNoteEditor}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsDark.background1,
  },
  addBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorsDark.primary,
    borderRadius: 50,
  },
});
