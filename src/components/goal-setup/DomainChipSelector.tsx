import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/lib/color';
import { DOMAIN_LABEL_KEY, DOMAINS, type Domain } from '@/lib/domain';

export type DomainChipSelectorProps = {
  selected: Domain | null;
  onSelect: (domain: Domain) => void;
  disabled?: boolean;
};

export function DomainChipSelector({ selected, onSelect, disabled = false }: DomainChipSelectorProps) {
  const { t } = useTranslation();
  const colors = useTheme();

  return (
    <View style={styles.row}>
      {DOMAINS.map((domain) => {
        const isActive = domain === selected;
        return (
          <Pressable
            key={domain}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive, disabled }}
            disabled={disabled}
            onPress={() => onSelect(domain)}
            style={[
              styles.chip,
              { backgroundColor: colors.surf2, borderColor: colors.border },
              isActive && { backgroundColor: withAlpha(colors.pri, 0.16), borderColor: colors.pri },
              disabled && styles.chipDisabled,
            ]}>
            <ThemedText type="smallBold" themeColor={isActive ? 'pri2' : 'textDim'}>
              {t(DOMAIN_LABEL_KEY[domain])}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.two + 1,
    paddingHorizontal: Spacing.three - 1,
  },
  chipDisabled: {
    opacity: 0.5,
  },
});
