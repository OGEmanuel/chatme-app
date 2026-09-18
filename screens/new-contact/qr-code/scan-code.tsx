import { getFullWidth } from '@/lib/utils';
import { CameraView } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { AppState, Linking, StyleSheet, View } from 'react-native';

const ScanCode = () => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View
      style={{
        width: getFullWidth(),
      }}
      className="flex-1 items-center justify-center px-6"
    >
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(async () => {
              await Linking.openURL(data);
            }, 500);
          }
        }}
      />
    </View>
  );
};

export default ScanCode;
