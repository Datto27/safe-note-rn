import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  colorsDark,
  colorsLight,
  colorsNeon,
  colorsYellow,
} from '../constants/colors';
import TextButton from '../components/Buttons/TextButton';
import ProfileEditor from '../components/Modals/ProfileEditor';
import { EditorInfoT } from '../interfaces/editor-info.type';
import { getData, removeData, saveData } from '../utils/storage';
import { ProfileI } from '../interfaces/profile';
import DeleteModal from '../components/Modals/DeleteModal';
import { useGlobalState } from '../contexts/GlobaState';
import { ThemeEnum } from '../enums/theme';
import ValidationModal from '../components/Modals/ValidationModal';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import DataReviewModal from '../components/Modals/DataReviewModal';
import EncryptionModal from '../components/Modals/EncryptionModal';
import SecondaryButton from '../components/Buttons/SecondaryButton';
import { decryptData } from '../utils/encrypt.private';

const ProfileScreen = () => {
  const { theme, setTheme } = useGlobalState();
  const [profile, setProfile] = useState<ProfileI | null>(null);
  const [ekey, setEkey] = useState<string | null>(null);
  const [editorInfo, setEditorInfo] = useState<EditorInfoT>({
    show: false,
    mode: 'create',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [validationOptions, setValidationOptions] = useState({
    text: '',
    successCb: () => {},
    cancelCb: () => {},
  });
  const [showDataOptions, setShowDataOptions] = useState(false);

  useEffect(() => {
    fetchEKey();
  }, []);

  const fetchEKey = () => {
    setModal(null);
    getData('key').then(res => setEkey(res));
  };

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

  const removeDataEncryption = () => {
    if (!ekey) return;
    setModal(null);
    getData('notes').then(notes => {
      Object.keys(notes).forEach(k => {
        notes[k] = {
          ...notes[k],
          info: decryptData(notes[k].info, ekey) ?? notes[k].info,
        };
      });
      removeData('key').then(res => {
        if (res === 'ok') {
          saveData('notes', notes).then(res => {
            setEkey(null);
          });
        }
      });
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background1 }]}>
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
            { backgroundColor: theme.colors.background2_09 },
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
      <View
        style={[
          styles.themesContainer,
          { backgroundColor: theme.colors.background2_09 },
        ]}>
        <TouchableOpacity
          style={[
            styles.theme,
            {
              backgroundColor:
                theme.type === ThemeEnum.DARK
                  ? 'white'
                  : theme.colors.secondary05,
            },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.DARK, colors: colorsDark })
          }>
          <View style={styles.themeFrame}>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsDark.primary },
              ]}></View>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsDark.secondary },
              ]}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.theme,
            {
              backgroundColor:
                theme.type === ThemeEnum.LIGHT
                  ? 'white'
                  : theme.colors.secondary05,
            },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.LIGHT, colors: colorsLight })
          }>
          <View style={styles.themeFrame}>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsLight.primary },
              ]}></View>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsLight.secondary },
              ]}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.theme,
            {
              backgroundColor:
                theme.type === ThemeEnum.YELLOW
                  ? 'white'
                  : theme.colors.secondary05,
            },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.YELLOW, colors: colorsYellow })
          }>
          <View style={styles.themeFrame}>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsYellow.primary },
              ]}></View>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsYellow.secondary },
              ]}></View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.theme,
            styles.shadow,
            {
              backgroundColor:
                theme.type === ThemeEnum.NEON
                  ? 'white'
                  : theme.colors.secondary05,
            },
          ]}
          onPress={() =>
            setTheme({ type: ThemeEnum.NEON, colors: colorsNeon })
          }>
          <View style={styles.themeFrame}>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsNeon.primary },
              ]}></View>
            <View
              style={[
                styles.themeColor,
                { backgroundColor: colorsNeon.secondary },
              ]}></View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.encryptionSection]}>
        {ekey ? (
          <View style={styles.encryptionBtns}>
            <TextButton
              text="Update Encryption Key"
              onPress={() => {
                if (profile) {
                  setModal('validate');
                  setValidationOptions({
                    text: 'Enter Your Password',
                    cancelCb: () => setModal(null),
                    successCb: () => setModal('encrypt-update'),
                  });
                } else {
                  setModal('encrypt-update');
                }
              }}
            />
            <SecondaryButton
              text="Remove"
              style={{ color: 'red' }}
              onPress={() => {
                if (profile) {
                  setModal('validate');
                  setValidationOptions({
                    text: 'Enter Your Password',
                    cancelCb: () => setModal(null),
                    successCb: () => removeDataEncryption(),
                  });
                } else {
                  setModal('remove-encrypt');
                }
              }}
            />
          </View>
        ) : (
          <TextButton
            text="Activate Data Encryption"
            onPress={() => {
              if (profile) {
                setModal('validate');
                setValidationOptions({
                  text: 'Enter Your Password',
                  cancelCb: () => setModal(null),
                  successCb: () => setModal('encrypt'),
                });
              } else {
                setModal('encrypt');
              }
            }}
          />
        )}
      </View>
      <View
        style={{
          height: showDataOptions ? 190 : 50,
          overflow: 'hidden',
          marginHorizontal: 10,
        }}>
        <TouchableOpacity
          style={[
            styles.dropdownBtn,
            {
              backgroundColor: theme.colors.background2,
            },
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setShowDataOptions(!showDataOptions);
          }}>
          <Text style={[styles.dropText, { color: theme.colors.text1 }]}>
            Mange your Data
          </Text>
          <FeatherIcon
            name={showDataOptions ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.text1}
          />
        </TouchableOpacity>
        <PrimaryButton
          text="Export Data"
          containerStyle={{}}
          style={{ fontSize: 16 }}
          onPress={() => {
            if (profile) {
              setModal('validate');
              setValidationOptions({
                text: 'Enter Your Password',
                cancelCb: () => setModal(null),
                successCb: () => setModal('export'),
              });
            } else {
              setModal('export');
            }
          }}
        />
        <PrimaryButton
          text="Import Data"
          containerStyle={{ marginTop: 0 }}
          style={{ fontSize: 16 }}
          onPress={() => {
            if (profile) {
              setModal('validate');
              setValidationOptions({
                text: 'Enter Your Password',
                cancelCb: () => setModal(null),
                successCb: () => setModal('import'),
              });
            } else {
              setModal('import');
            }
          }}
        />
      </View>
      <DataReviewModal
        visible={modal === 'export' || modal === 'import'}
        type={modal}
        text=""
        onClose={() => setModal(null)}
      />
      <ValidationModal
        visible={modal === 'validate'}
        profile={profile}
        text={validationOptions.text}
        cancelCb={validationOptions.cancelCb}
        successCb={validationOptions.successCb}
      />
      <EncryptionModal
        visible={modal === 'encrypt' || modal === 'encrypt-update'}
        mode={modal}
        title="Enter Encryption Key"
        text="You have to memorize this key to decrypt your info, if needed"
        cancelCb={() => setModal(null)}
        successCb={fetchEKey}
      />
      <DeleteModal
        visible={modal === 'remove-encrypt'}
        text="Do you want to remove encryption key?"
        deleteCb={removeDataEncryption}
        cancelCb={() => setModal(null)}
      />
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
  themesContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    padding: 8,
    borderRadius: 20,
  },
  theme: {
    padding: 6,
    marginHorizontal: 8,
    borderRadius: 50,
  },
  themeFrame: {
    flexDirection: 'row',
    borderRadius: 50,
    overflow: 'hidden',
  },
  shadow: {
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    // elevation: 5,
  },
  textShadow: {
    textShadowColor: colorsNeon.textShadow,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  },
  themeColor: {
    height: 30,
    width: 15,
  },
  encryptionSection: {
    alignItems: 'flex-start',
    padding: 0,
    marginVertical: 15,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  encryptionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dropText: {
    fontSize: 18,
    fontFamily: 'JosefinSans-Medium',
  },
});
