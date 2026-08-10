import { Redirect, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { requestEmailOtp, verifyEmailOtp } from '@/lib/email-otp';

export default function OtpScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!email) return <Redirect href="/login" />;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyEmailOtp(email, code);
    } catch {
      Alert.alert(t('auth.errorGeneric'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await requestEmailOtp(email);
      Alert.alert(t('auth.otp.resendSent'));
    } catch {
      Alert.alert(t('auth.errorGeneric'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ThemedText type="subtitle" style={styles.title}>
          {t('auth.otp.title')}
        </ThemedText>
        <ThemedText type="small" themeColor="textDim" style={styles.subtitle}>
          {t('auth.otp.subtitle', { email })}
        </ThemedText>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('auth.otp.codePlaceholder')}
          placeholderTextColor={Colors.textFaint}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.otp.verify')}
          onPress={handleVerify}
          disabled={isVerifying || code.length === 0}
          style={({ pressed }) => [
            styles.verifyButton,
            (isVerifying || code.length === 0) && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={styles.verifyLabel}>
            {t('auth.otp.verify')}
          </ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('auth.otp.resend')}
          onPress={handleResend}
          disabled={isResending}
          style={styles.resendButton}>
          <ThemedText type="link" themeColor="pri2">
            {t('auth.otp.resend')}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: Spacing.two,
    lineHeight: 20,
  },
  input: {
    marginTop: Spacing.five,
    backgroundColor: Colors.surf,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.three,
    color: Colors.text,
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: Spacing.three,
    backgroundColor: Colors.pri,
    borderRadius: 14,
    paddingVertical: Spacing.three - 1,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  verifyLabel: {
    color: '#ffffff',
  },
  resendButton: {
    marginTop: Spacing.three,
    alignItems: 'center',
  },
});
