import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colorsDark, colorsLight, colorsYellow } from '../constants/colors';
import TextButton from '../components/Buttons/TextButton';
import ProfileEditor from '../components/Modals/ProfileEditor';
import { EditorInfoT } from '../interfaces/editor-info.type';
import { getData, removeData } from '../utils/storage';
import { ProfileI } from '../interfaces/profile';
import DeleteModal from '../components/Modals/DeleteModal';
import { useGlobalState } from '../contexts/GlobaState';
import { ThemeEnum } from '../enums/theme';

const ProfileScreen = () => {
  const { theme, setTheme } = useGlobalState();
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
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
      <View
        style={[
          styles.profileCard,
          { backgroundColor: theme.colors.primary05 },
        ]}>
        <View
          style={[
            styles.profileIconContainer,
            { backgroundColor: theme.colors.background2_09 },
          ]}>
          <FeatherIcon name="user" color={theme.colors.text2} size={42} />
        </View>
        {profile ? (
          <View style={styles.profile}>
            <View>
              <Text style={[styles.profileName, { color: theme.colors.text1 }]}>
                {profile.username}
              </Text>
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
            <Text style={[styles.profileName, { color: theme.colors.text1 }]}>
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
      <View
        style={[
          styles.themesContainer,
          { backgroundColor: theme.colors.background2_09 },
        ]}>
        <TouchableOpacity
          style={[
            styles.theme,
            theme.type === ThemeEnum.DARK && { borderColor: 'white' },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.DARK, colors: colorsDark })
          }>
          <View
            style={[
              styles.themeColor,
              { backgroundColor: colorsDark.primary },
            ]}></View>
          <View
            style={[
              styles.themeColor,
              { backgroundColor: colorsDark.background1 },
            ]}></View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.theme,
            theme.type === ThemeEnum.LIGHT && { borderColor: 'white' },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.LIGHT, colors: colorsLight })
          }>
          <View
            style={[
              styles.themeColor,
              { backgroundColor: colorsLight.primary },
            ]}></View>
          <View
            style={[
              styles.themeColor,
              { backgroundColor: colorsLight.background1 },
            ]}></View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.theme,
            theme.type === ThemeEnum.YELLOW && { borderColor: 'white' },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.YELLOW, colors: colorsYellow })
          }>
          <View
            style={[
              styles.themeColor,
              { backgroundColor: colorsYellow.primary },
            ]}></View>
          <View
            style={[
              styles.themeColor,
              { backgroundColor: colorsYellow.background1 },
            ]}></View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    marginVertical: 20,
    marginHorizontal: 10,
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
    marginVertical: 2,
    marginRight: 5,
  },
  themesContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 20,
  },
  theme: {
    flexDirection: 'row',
    marginHorizontal: 8,
    borderColor: 'grey',
    borderWidth: 6,
    borderRadius: 50,
    overflow: 'hidden',
  },
  themeColor: {
    height: 30,
    width: 15,
  },
});
