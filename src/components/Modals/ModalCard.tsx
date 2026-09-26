import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { ReactNode } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useGlobalState } from '../../contexts/GlobaState';
import { dangerColor, dangerTint } from '../../constants/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  // A Feather icon name, or a custom node (e.g. an animated icon)
  icon: string | ReactNode;
  title: string;
  subtitle?: string;
  tone?: 'default' | 'danger';
  // Optional control in the header's right corner (e.g. delete)
  headerAction?: ReactNode;
  children?: ReactNode;
  footer: ReactNode;
};

// Shared frame for every dialog, modelled on the export/import modal:
// a centred card with an icon tile, title and subtitle, a scrollable body
// and a row of actions at the bottom. There is no close button: the footer's
// Cancel and the Android back button both call onClose.
const ModalCard = ({
  visible,
  onClose,
  icon,
  title,
  subtitle,
  tone = 'default',
  headerAction,
  children,
  footer,
}: Props) => {
  const { theme } = useGlobalState();
  const accent = tone === 'danger' ? dangerColor : theme.colors.primary;
  const tint = tone === 'danger' ? dangerTint : theme.colors.primary02;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.center}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.modalBg,
                borderColor: theme.colors.modalBorder,
              },
            ]}>
            <View style={styles.header}>
              <View style={[styles.iconWrap, { backgroundColor: tint }]}>
                {typeof icon === 'string' ? (
                  <FeatherIcon name={icon} size={18} color={accent} />
                ) : (
                  icon
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, { color: theme.colors.text1 }]}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text
                    style={[styles.subtitle, { color: theme.colors.text2 }]}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              {headerAction}
            </View>

            {children ? (
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            ) : null}

            <View style={styles.footer}>{footer}</View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default ModalCard;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    maxHeight: '90%',
    paddingVertical: 24,
    borderRadius: 32,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  body: {
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 16,
  },
});
