import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type RoadmapHeroProps = {
  goal: string;
  careerLevel: string;
  stageProgressLabel: string;
};

export function RoadmapHero({ goal, careerLevel, stageProgressLabel }: RoadmapHeroProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.goal}>
        {goal}
      </ThemedText>
      <ThemedText type="small" themeColor="textDim" style={styles.careerLevel}>
        {careerLevel}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="pri2" style={styles.progress}>
        {stageProgressLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.three - 2,
  },
  goal: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  careerLevel: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  progress: {
    marginTop: Spacing.two,
  },
});
