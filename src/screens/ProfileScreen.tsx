import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  colorsDark,
  colorsLight,
  colorsNeon,
  colorsYellow,
} from '../constants/colors';
import TextButton from '../components/Buttons/TextButton';
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
import ProfileCard from '../components/ProfileCard';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme, setTheme } = useGlobalState();
  const [profile, setProfile] = useState<ProfileI | null>(null);
  const [ekey, setEkey] = useState<string | null>(null);
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

  const removeDataEncryption = () => {
    if (!ekey) {
      return;
    }
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
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background1,
          paddingBottom: insets.bottom + 20,
        },
      ]}>
      <ProfileCard profile={profile} setProfile={setProfile} />
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text1 }]}>
          Theme
        </Text>
      </View>
      <View
        style={[
          styles.themesContainer,
          { backgroundColor: theme.colors.background2 },
        ]}>
        {[
          { type: ThemeEnum.DARK, colors: colorsDark, label: 'Dark' },
          { type: ThemeEnum.LIGHT, colors: colorsLight, label: 'Light' },
          { type: ThemeEnum.YELLOW, colors: colorsYellow, label: 'Gold' },
          { type: ThemeEnum.NEON, colors: colorsNeon, label: 'Neon' },
        ].map(item => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.themePill,
              theme.type === item.type && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setTheme({ type: item.type, colors: item.colors })}>
            <View
              style={[
                styles.themeDot,
                { backgroundColor: item.colors.primary },
                theme.type === item.type && {
                  borderColor: 'white',
                  borderWidth: 2,
                },
              ]}
            />
            <Text
              style={[
                styles.themeLabel,
                {
                  color:
                    theme.type === item.type ? 'white' : theme.colors.text2,
                },
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text1 }]}>
          Security & Archive
        </Text>
      </View>
      <View
        style={[
          styles.encryptionSection,
          { backgroundColor: theme.colors.background2 },
        ]}>
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
            <TouchableOpacity
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
              style={{ padding: 10 }}>
              <FeatherIcon name="trash-2" size={20} color="red" />
            </TouchableOpacity>
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
        <View style={styles.divider} />
        <TextButton
          text="Show Deleted Notes"
          color="red"
          onPress={() => navigation.navigate('Archive')}
        />
      </View>
      <View
        style={{
          height: showDataOptions ? 190 : 80,
          overflow: 'hidden',
          marginHorizontal: 10,
        }}>
        <TouchableOpacity
          style={[
            styles.dropdownBtn,
            {
              backgroundColor: theme.colors.btn1,
            },
          ]}
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setShowDataOptions(!showDataOptions);
          }}>
          <Text style={[styles.dropText, { color: theme.colors.btnText1 }]}>
            Manage your Data
          </Text>
          <FeatherIcon
            name={showDataOptions ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.text1}
          />
        </TouchableOpacity>
        <PrimaryButton
          text="Export Data"
          containerStyle={{ backgroundColor: theme.colors.secondary }}
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
          containerStyle={{
            marginTop: 0,
            backgroundColor: theme.colors.secondary,
          }}
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
  sectionHeader: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  themesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 24,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  themeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  encryptionSection: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 8,
  },
  encryptionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 20,
  },
  dropText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
  },
});
