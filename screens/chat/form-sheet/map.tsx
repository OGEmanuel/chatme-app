import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import MapView from 'react-native-maps';

const MapScreen = () => {
  const [coordinate, setCoordinate] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Location permission denied');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    setCoordinate({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View className="flex-1">
      <MapView
        style={{ flex: 1, width: '100%', height: '100%' }}
        initialRegion={{
          latitude: 6.5244,
          longitude: 3.3792,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={event => {
          const { latitude, longitude } = event.nativeEvent.coordinate;

          console.log({ latitude, longitude });
        }}
      />
    </View>
  );
};

export default MapScreen;
