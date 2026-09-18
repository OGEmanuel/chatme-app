import { getFullWidth } from '@/lib/utils';
import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './header';
import MyCode from './my-code';
import ScanCode from './scan-code';

const QrCodeScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToPage = (index: number): void => {
    scrollRef.current?.scrollTo({
      x: index * getFullWidth(),
      animated: true,
    });
  };

  const goToPage = (page: number): void => {
    setActiveTab(page);
    scrollToPage(page);
  };

  const handleScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const position = e.nativeEvent.contentOffset.x;
    setActiveTab(Math.round(position / getFullWidth()));
  };

  return (
    <SafeAreaView className="flex-1">
      <Header activeTab={activeTab} goToPage={goToPage} />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        className="flex-1"
        onMomentumScrollEnd={handleScrollEnd}
      >
        <MyCode />
        <ScanCode />
      </ScrollView>
    </SafeAreaView>
  );
};

export default QrCodeScreen;
