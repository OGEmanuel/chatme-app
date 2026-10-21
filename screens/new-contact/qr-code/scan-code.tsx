import { getFullWidth } from '@/lib/utils';
import { CameraView } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { Alert, AppState, Linking, StyleSheet, View } from 'react-native';

const ScanCode = () => {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = useRef(true);

  useEffect(() => {
    isActive.current = true;

    return () => {
      isActive.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

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

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!data || qrLock.current || !isActive.current) return;

    qrLock.current = true;

    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null;

      if (!isActive.current) {
        qrLock.current = false;
        return;
      }

      try {
        await Linking.openURL(data);
      } catch (error) {
        console.error('Failed to open QR code URL:', error);

        // Replace with your app's toast or alert.
        Alert.alert(
          'Unable to open link',
          'Please try scanning the QR code again.',
        );
      } finally {
        qrLock.current = false;
      }
    }, 500);
  };

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
        onBarcodeScanned={handleBarcodeScanned}
      />
    </View>
  );
};

export default ScanCode;
