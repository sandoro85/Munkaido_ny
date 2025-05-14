import { StyleSheet, View, SafeAreaView, ScrollView, Platform, ViewProps, StatusBar } from 'react-native';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  padded?: boolean;
}

export default function ScreenContainer({
  children,
  scrollable = true,
  safeArea = true,
  padded = true,
  style,
  ...props
}: ScreenContainerProps) {
  const Container = safeArea ? SafeAreaView : View;
  const contentContainerStyle = [
    styles.container,
    padded && styles.padded,
    style,
  ];
  
  if (scrollable) {
    return (
      <Container style={styles.safeArea} {...props}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Container>
    );
  }
  
  return (
    <Container style={[styles.safeArea, styles.flex]} {...props}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[contentContainerStyle, styles.flex]}>
        {children}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  padded: {
    padding: 16,
  },
});