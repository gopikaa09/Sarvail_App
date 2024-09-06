import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, FlatList, Keyboard, ScrollView, Dimensions, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageCard from '@/components/ImageCard';
import Badge from '@/components/Badge';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import SearchInput from '@/components/SearchInput';
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

const Home = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [carouselData, setCarouselData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false); // Start with false
  const [searchFocused, setSearchFocused] = useState(false);



  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const prevScrollY = useRef(0);

  useEffect(() => {
    fetchData(selectedFilters);
  }, [selectedFilters]);

  const fetchData = async (categories) => {
    setLoading(true);
    setRefreshing(true);
    try {
      const categoryQuery = categories.length > 0 ? `&category=${categories.join(',')}` : '';
      const response = await fetch(
        `http://sarvail.net/wp-json/ds-custom_endpoints/v1/posts?per_page=200${categoryQuery}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      const carouselData = json.slice(1, 4);
      setCarouselData(carouselData);
      setData(json);
      setFilteredData(json);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query]);

  const handleSearch = () => {
    if (query) {
      const filtered = data.filter((item) =>
        item.post_title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const TopFilters = [
    { value: 'alumni-news', label: 'Alumni News' },
    { value: 'know-sarvalians', label: 'Know Sarvalians' },
    { value: 'reunions', label: 'Reunions' },
    { value: 'events', label: 'Events' },
    { value: 'school-news', label: 'School News' },
    { value: 'school-development', label: 'School Development' },
    { value: 'help-sarvailians', label: 'Help Sarvailians' },
  ];

  const handleFilters = (category) => {
    setSelectedFilters((prevSelected) => {
      if (prevSelected.includes(category)) {
        return prevSelected.filter((item) => item !== category);
      } else {
        return [...prevSelected, category];
      }
    });
  };

  const renderItem = React.useCallback(({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => {
        router.push(`/details/${item.ID}`);
      }}>
        <Image
          source={{ uri: item?.featured_image?.medium_large }}
          style={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.background}
        />
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text className='bg-secondary-100 text-slate-50 p-2 rounded-3xl font-semibold self-start my-0 opacity-80 text-xs'>{item?.categories[0]?.name}</Text>
        <Text style={styles.text} numberOfLines={2}
          onPress={() => {
            router.push(`/details/${item.ID}`);
          }}
        >{item.post_title}</Text>
      </View>
    </View>
  ), [router]);

  const headerComponent = () => (
    <View className="mt-6">
      <View className='flex flex-row justify-between m-2'>
        <View className='flex flex-row items-end'>
          <Text className='text-secondary-100 text-4xl'>S</Text>
          <Text className="font-semibold text-3xl text-gray-100">arvail</Text>
        </View>
      </View>

      <View className='px-2'>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {TopFilters.map((filter, index) => (
              <Badge
                key={index}
                text={filter.label}
                isSelected={selectedFilters.includes(filter.value)}
                onPress={() => handleFilters(filter.value)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: searchVisible || searchFocused ? 1 : 0,
            height: searchVisible || searchFocused ? 60 : 0,
            transform: [{ translateY: searchVisible || searchFocused ? 0 : -60 }],
          }
        ]}
      >
        <SearchInput
          placeholder="Search..."
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </Animated.View>

      <ScrollView className='-my-2'>
        <Carousel
          data={carouselData}
          width={width}
          height={280}
          scrollAnimationDuration={400}
          snapEnabled={true}
          mode='parallax'
          autoPlay={true}
          autoPlayInterval={2000}
          showPagination={true}
          renderItem={renderItem}
        />
      </ScrollView>
    </View>
  );

  const onRefresh = useCallback(() => {
    fetchData(selectedFilters);
  }, [selectedFilters]);

  const debouncedHandleScroll = debounce((event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset > prevScrollY.current) {
      if (!searchFocused) {
        setSearchVisible(false);
      }
    } else {
      setSearchVisible(true);
    }

    prevScrollY.current = currentOffset;
  }, 100);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        // Ensure event and event.nativeEvent are not null
        if (event && event.nativeEvent) {
          const currentOffset = event.nativeEvent.contentOffset.y;

          // Ensure prevScrollY.current is defined
          if (prevScrollY.current !== undefined) {
            if (currentOffset > prevScrollY.current) {
              // Scrolling down
              if (!searchFocused) {
                setSearchVisible(false);
              }
            } else {
              // Scrolling up
              setSearchVisible(true);
            }

            // Update previous scroll position
            prevScrollY.current = currentOffset;
          }
        }
      },
    }
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-lg">Error: {error.message}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={({ item }) => <ImageCard item={item} />}
          ListHeaderComponent={headerComponent()}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-100 text-lg">No data available</Text>
            </View>
          )}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          refreshing={refreshing}
          onRefresh={onRefresh}





          onScroll={handleScroll}

        />
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  itemContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  image: {
    width: width * 0.97,
    height: 280,
    borderRadius: 10,
  },
  background: {
    position: 'absolute',
    width: width * 0.97,
    height: 280,
    borderRadius: 10,
    bottom: 0,
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    lineHeight: 32
  },
  text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  searchContainer: {
    backgroundColor: '#161622',
    zIndex: 1,
    elevation: 2,
    paddingHorizontal: 10,
    paddingTop: 10,
    overflow: 'hidden',
  },
});

