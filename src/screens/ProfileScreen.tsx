import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colorsDark } from '../constants/colors';
import TextButton from '../components/Buttons/TextButton';
import ProfileEditor from '../components/Modals/ProfileEditor';
import { EditorInfoT } from '../interfaces/editor-info.type';
import { getData, removeData } from '../utils/storage';
import { ProfileI } from '../interfaces/profile';
import DeleteModal from '../components/Modals/DeleteModal';

const ProfileScreen = () => {
  const [profile, setProfile] = useState<ProfileI | null>(null);
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
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileIconContainer}>
          <FeatherIcon name="user" color={colorsDark.text2} size={42} />
        </View>
        {profile ? (
          <View style={styles.profile}>
            <View>
              <Text style={styles.profileName}>{profile.username}</Text>
              <TextButton
                text="Update Profile"
                style={{ marginTop: 10 }}
                onPress={() => setEditorInfo({ mode: 'update', show: true })}
              />
            </View>
            <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
              <FeatherIcon name="x-octagon" color="red" size={32} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noProfile}>
            <Text style={styles.profileName}>No Profile</Text>
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
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsDark.background1,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colorsDark.primary05,
    padding: 20,
    borderRadius: 20,
    margin: 10,
  },
  profileIconContainer: {
    justifyContent: 'center',
    backgroundColor: colorsDark.background2_09,
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
  },
  profileName: {
    flexWrap: 'wrap',
    fontSize: 18,
    fontWeight: '600',
    color: colorsDark.text1,
    marginTop: 4,
    marginRight: 5,
  },
});
