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
  const [selectedFilters, setSelectedFilters] = useState(['']);
  const [carouselData, setCarouselData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false); // Start with false
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBarHeight = useRef(new Animated.Value(0)).current;  // Animation for height and translateY
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const [isCarouselScrolling, setIsCarouselScrolling] = useState(false);  // New state
  const [page, setPage] = useState(1); // Track current page
  const [hasMore, setHasMore] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const prevScrollY = useRef(0);

  useEffect(() => {
    fetchData();
  }, [selectedFilters, page]);  // Include 'page' here


  const fetchCorouselData = async () => {
    setLoading(true);
    setRefreshing(page === 1);
    try {
      const response = await fetch(
        `https://sarvail.net/wp-json/ds-custom_endpoints/v1/posts?per_page=20`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      setCarouselData(json.slice(0, 3));
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchCorouselData()
  }, [])
  const fetchData = async () => {
    setLoading(true);
    setRefreshing(page === 1);
    try {
      const categoryQuery = selectedFilters.length > 0 ? `&category=${selectedFilters[0]}` : '';

      const response = await fetch(
        `https://sarvail.net/wp-json/ds-custom_endpoints/v1/posts?per_page=20&page=${page}${categoryQuery}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();

      if (page === 1) {
        // If it's the first page, reset the data and filtered data
        setData(json);
        setFilteredData(json);
      } else {
        // For subsequent pages, append the new data
        setData((prevData) => [...prevData, ...json]);
        setFilteredData((prevData) => [...prevData, ...json]);
      }

      setHasMore(json.length >= 20); // Check if there are more items
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFilters = (category) => {
    // Check if the selected filter is already applied
    if (selectedFilters.includes(category)) {
      // If already selected, remove the filter (deselect)
      setSelectedFilters([]);
    } else {
      // If not selected, apply the new filter (select)
      setSelectedFilters([category]);
    }

    // Reset page to 1 when the filter changes
    setPage(1);

    // Fetch the filtered data
    fetchData();
  };


  useEffect(() => {
    handleSearch();
  }, [query]);

  const handleSearch = () => {

    if (query) {
      console.log('====================================');
      console.log(query);
      console.log('====================================');
      const filtered = data.filter((item) =>
        item.post_title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  };

  const TopFilters = [
    { value: '', label: 'All' },
    { value: 'alumni-news', label: 'Alumni News' },
    { value: 'know-sarvalians', label: 'Know Sarvalians' },
    { value: 'renuions', label: 'Reunions' },
    { value: 'events', label: 'Events' },
    { value: 'school-news', label: 'School News' },
    { value: 'school-development', label: 'School Development' },
    { value: 'help-sarvailians', label: 'Help Sarvailians' },
  ];


  const CorouselCard = React.memo(({ item, index, activeIndex, onPress }) => {
    const animatedOpacity = useRef(new Animated.Value(index === activeIndex ? 1 : 1)).current;

    useEffect(() => {
      Animated.timing(animatedOpacity, {
        toValue: index === activeIndex ? 1 : 1,
        duration: 250,  // Adjust the duration to your liking
        useNativeDriver: true,
      }).start();
    }, [index, activeIndex]);

    return (
      <TouchableOpacity
        onPress={() => {
          if (index === activeIndex) {
            onPress(item.ID);
          }
        }}
        disabled={index !== activeIndex}
      >
        <Animated.View style={[styles.itemContainer, { opacity: animatedOpacity }]}>
          <Image
            source={{ uri: item?.featured_image?.medium_large }}
            style={styles.image}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
            style={styles.background}
          />
          <View style={styles.textContainer}>
            <Text className='bg-secondary-100 text-slate-50 p-2 rounded-3xl font-semibold self-start my-0 opacity-80 text-xs'>{item?.categories[0]?.name}</Text>
            <Text style={styles.text} numberOfLines={2}>
              {item.post_title}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  });




  const headerComponent = () => (
    <View className="mt-2">
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
            height: searchBarHeight,
            opacity: searchBarOpacity,
            transform: [{
              translateY: searchBarHeight.interpolate({
                inputRange: [0, 60],
                outputRange: [-60, 0],
              })
            }],
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
      {
        !query && selectedFilters[0] === '' &&
        <ScrollView className='-my-2'>
          <Carousel
            data={carouselData}
            width={width}
            height={280}
            scrollAnimationDuration={200}  // Reduced from 400ms to 250ms for quicker response
            snapEnabled={true}
            mode="parallax"
            autoPlay={true}
            autoPlayInterval={2000}
            showPagination={true}
            renderItem={({ item, index }) => (
              <CorouselCard
                key={item.ID}
                item={item}
                index={index}
                activeIndex={activeIndex}
                onPress={(id) => router.push(`/details/${id}`)} // Pass press handler
              />
            )}
            onScrollBeginDrag={() => setIsCarouselScrolling(true)}   // Disable FlatList scroll when carousel starts scrolling
            onScrollEndDrag={() => setIsCarouselScrolling(false)}
            onSnapToItem={(index) => setActiveIndex(index)}  // Update activeIndex instantly
          />

        </ScrollView>
      }

    </View>
  );



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
  const animateSearchBar = (visible) => {
    Animated.parallel([
      Animated.timing(searchBarHeight, {
        toValue: visible ? 60 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(searchBarOpacity, {
        toValue: visible ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        if (event && event.nativeEvent) {
          const currentOffset = event.nativeEvent.contentOffset.y;
          if (prevScrollY.current !== undefined) {
            if (currentOffset > prevScrollY.current && !searchFocused) {
              animateSearchBar(false); // Hide search bar smoothly
            } else {
              animateSearchBar(true);  // Show search bar smoothly
            }
            prevScrollY.current = currentOffset;
          }
        }
      },
    }
  );
  const handleLoadMore = debounce(() => {
    if (!hasMore || loading) return;
    setPage((prevPage) => prevPage + 1);
  }, 200);

  const [visibleItems, setVisibleItems] = useState([]);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setVisibleItems(viewableItems.map(item => item.key));
  });

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {loading && data.length === 0 ? (
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
          renderItem={({ item }) => (
            <View key={item?.ID}>
              <ImageCard item={item}
                isVisible={visibleItems.includes(item.ID.toString())}
              />
            </View>
          )}
          ListHeaderComponent={headerComponent()}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-100 text-lg">No data available</Text>
            </View>
          )}
          ListFooterComponent={
            loading && hasMore && filteredData.length > 0 ? ( // Show loader at the end
              <View className="flex-1 justify-center items-center p-4">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : null
          }
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          refreshing={refreshing}
          onRefresh={() => {
            setPage(1);  // Reset page
            fetchData();  // Fetch new data
          }}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          onScroll={handleScroll}
          scrollEnabled={!isCarouselScrolling}  // Disable scroll when carousel is active
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
    left: 20,
    right: 20,
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
