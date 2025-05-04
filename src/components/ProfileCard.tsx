import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { Dispatch, useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useGlobalState } from '../contexts/GlobaState';
import { getData, removeData } from '../utils/storage';
import { EditorInfoT } from '../interfaces/editor-info.type';
import { ProfileI } from '../interfaces/profile';
import TextButton from './Buttons/TextButton';
import ProfileEditor from './Modals/ProfileEditor';
import DeleteModal from './Modals/DeleteModal';
import { colorsNeon } from '../constants/colors';

type Props = {
  profile: ProfileI | null;
  setProfile: Dispatch<React.SetStateAction<ProfileI | null>>;
};

const ProfileCard = ({ profile, setProfile }: Props) => {
  const { theme, setTheme } = useGlobalState();
  const [editorInfo, setEditorInfo] = useState<EditorInfoT>({
    show: false,
    mode: 'create',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [editorInfo.show]);

  const fetchProfile = () => {
    getData('profile').then(res => {
      setProfile(res);
    });
  };

  const deleteProfile = () => {
    removeData('profile').then(() => {
      setShowDeleteModal(false);
      fetchProfile();
    });
  };

  return (
    <View
      style={[
        styles.profileCard,
        {
          backgroundColor: theme.colors.modalBg,
          shadowColor: theme.colors.shadowColor1,
          borderColor: theme.colors.modalBorder,
        },
      ]}>
      <View
        style={[
          styles.profileIconContainer,
          { backgroundColor: theme.colors.background2 },
        ]}>
        <FeatherIcon name="user" color={theme.colors.text2} size={42} />
      </View>
      {profile ? (
        <View style={styles.profile}>
          <View>
            <Text
              style={[
                styles.profileName,
                theme.colors.shadowColor1 ? styles.textShadow : null,
                { color: theme.colors.text1 },
              ]}>
              {profile.username}
            </Text>
            <TextButton
              text="Update Profile"
              style={{ marginTop: 0, marginLeft: -4 }}
              onPress={() => setEditorInfo({ mode: 'update', show: true })}
            />
          </View>
          <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
            <FeatherIcon name="x-octagon" color="red" size={32} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noProfile}>
          <Text
            style={[
              styles.profileName,
              styles.textShadow,
              {
                color: theme.colors.text1,
                textShadowColor: theme.colors.textShadow,
              },
            ]}>
            No Profile
          </Text>
          <TextButton
            text="Create Profile"
            style={{ alignSelf: 'center' }}
            onPress={() => setEditorInfo({ mode: 'create', show: true })}
          />
        </View>
      )}
      <ProfileEditor
        mode={editorInfo.mode}
        visible={editorInfo.show}
        setVisible={() => setEditorInfo({ mode: 'create', show: false })}
        profile={profile}
      />
      <DeleteModal
        visible={showDeleteModal}
        text="Do you want to delete profile?"
        deleteCb={() => deleteProfile()}
        cancelCb={() => setShowDeleteModal(false)}
      />
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 13,
  },
  profileIconContainer: {
    justifyContent: 'center',
    padding: 10,
    marginRight: 20,
    borderRadius: 15,
  },
  profile: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noProfile: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontFamily: 'JosefinSans-Bold',
    flexWrap: 'wrap',
    fontSize: 18,
    padding: 5,
  },
  textShadow: {
    textShadowColor: colorsNeon.textShadow,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
});
