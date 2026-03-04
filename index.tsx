import { registerRootComponent } from 'expo';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>🚀 Vyra Fitness</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

registerRootComponent(App);

