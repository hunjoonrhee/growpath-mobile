import { useRouter } from 'expo-router';
import { Apple } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/auth/BrandHeader';
import { Divider } from '@/components/auth/Divider';
import { EmailOtpForm } from '@/components/auth/EmailOtpForm';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { requestEmailOtp } from '@/lib/email-otp';
import { signInWithOAuth, type OAuthProvider } from '@/lib/oauth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isSigningInWith, setIsSigningInWith] = useState<OAuthProvider | null>(null);

  const handleOAuthPress = async (provider: OAuthProvider) => {
    setIsSigningInWith(provider);
    try {
      await signInWithOAuth(provider);
    } catch {
      Alert.alert(t('auth.errorGeneric'));
    } finally {
      setIsSigningInWith(null);
    }
  };

  const handleApplePress = () => {
    Alert.alert(t('auth.appleComingSoon'));
  };

  const handleEmailSubmit = async () => {
    setIsRequestingOtp(true);
    try {
      await requestEmailOtp(email);
      router.push({ pathname: '/otp', params: { email } });
    } catch {
      Alert.alert(t('auth.errorGeneric'));
    } finally {
      setIsRequestingOtp(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.spacer} />
        <BrandHeader tagline={t('auth.tagline')} />
        <View style={styles.spacer} />
        <View style={styles.social}>
          <SocialLoginButton variant="apple" icon={Apple} label={t('auth.appleContinue')} onPress={handleApplePress} />
          <SocialLoginButton
            variant="google"
            label={t('auth.googleContinue')}
            onPress={() => handleOAuthPress('google')}
            disabled={isSigningInWith !== null}
          />
          <SocialLoginButton
            variant="github"
            label={t('auth.githubContinue')}
            onPress={() => handleOAuthPress('github')}
            disabled={isSigningInWith !== null}
          />
        </View>
        <Divider label={t('auth.or')} />
        <EmailOtpForm
          email={email}
          onChangeEmail={setEmail}
          onSubmit={handleEmailSubmit}
          isSubmitting={isRequestingOtp}
          placeholder={t('auth.emailPlaceholder')}
          submitLabel={t('auth.requestOtp')}
        />
        <ThemedText type="small" themeColor="textFaint" style={styles.hint}>
          {t('auth.hint')}
        </ThemedText>
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
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  social: {
    gap: Spacing.two + 2,
    marginTop: Spacing.five,
  },
  hint: {
    marginTop: Spacing.three - 2,
    textAlign: 'center',
    lineHeight: 18,
  },
});
