import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { DOMAIN_LABEL_KEY, DOMAINS, type Domain } from '@/lib/domain';

export type DomainChipSelectorProps = {
  selected: Domain | null;
  onSelect: (domain: Domain) => void;
};

export function DomainChipSelector({ selected, onSelect }: DomainChipSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      {DOMAINS.map((domain) => {
        const isActive = domain === selected;
        return (
          <Pressable
            key={domain}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect(domain)}
            style={[styles.chip, isActive && styles.chipActive]}>
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
    backgroundColor: Colors.surf2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingVertical: Spacing.two + 1,
    paddingHorizontal: Spacing.three - 1,
  },
  chipActive: {
    backgroundColor: 'rgba(108,99,255,0.16)',
    borderColor: Colors.pri,
  },
});
