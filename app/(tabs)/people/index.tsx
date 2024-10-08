import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, FlatList, Animated, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import SimpleStore from 'react-native-simple-store';
import UsersCard from '@/components/UsersCard';
import SearchInput from '@/components/SearchInput';
import { debounce } from 'lodash';

const People = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [batch, setBatch] = useState('');
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [user, setUser] = useState(null);
  const searchBarHeight = useRef(new Animated.Value(0)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const prevScrollY = useRef(0);

  const getUser = async () => {
    try {
      const storedUser = await SimpleStore.get('user');
      setUser(storedUser);
    } catch (err) {
      console.error('Failed to get user from SimpleStore', err);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user]);

  // Refactored filtering logic: Apply all filters together
  useEffect(() => {
    applyFilters();
  }, [batch, name, profession, data]);

  const applyFilters = () => {
    let filtered = data;

    // Apply batch filter
    if (batch.trim()) {
      filtered = filtered.filter(user =>
        user?.ds_batch?.toLowerCase().includes(batch.toLowerCase())
      );
    }

    // Apply name filter
    if (name.trim()) {
      filtered = filtered.filter(user =>
        user?.user_nicename?.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Apply profession filter
    if (profession.trim()) {
      filtered = filtered.filter(user =>
        user?.ds_profession?.toLowerCase().includes(profession.toLowerCase())
      );
    }

    // Set the filtered data
    setFilteredData(filtered);
  };

  const fetchData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await axios.get(
        'https://sarvail.net/wp-json/ds-custom_endpoints/v1/users',
        {
          headers: {
            'Api-Token': `Bearer ${user.token}`,
          },
        }
      );
      setData(response.data);
      setFilteredData(response.data); // Set both data and filteredData
    } catch (error) {
      setError(error);
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const animateSearchBar = (visible) => {
    Animated.parallel([
      Animated.timing(searchBarHeight, {
        toValue: visible ? 180 : 0,
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

  const headerComponent = () => (
    <>
      <View className='mt-6 px-6'>
        <View className='flex flex-row items-end'>
          <Text className='text-secondary-100 text-4xl'>S</Text>
          <Text className="font-semibold text-3xl text-gray-100">arvail</Text>
        </View>
        <Text className="font-semibold text-gray-100 text-lg mb-3">People</Text>
      </View>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            height: searchBarHeight,
            opacity: searchBarOpacity,
            transform: [{
              translateY: searchBarHeight.interpolate({
                inputRange: [0, 180],
                outputRange: [-180, 0],
              })
            }],
          }
        ]}
      >
        <View className='flex flex-col gap-2 mx-1'>
          <View>
            <SearchInput
              placeholder="Search by Batch"
              query={batch}
              setQuery={setBatch}
              onSearch={() => applyFilters()} // Trigger filtering when searching
            />
          </View>
          <View>
            <SearchInput
              placeholder="Search by Name"
              query={name}
              setQuery={setName}
              onSearch={() => applyFilters()} // Trigger filtering when searching
            />
          </View>
          <View>
            <SearchInput
              placeholder="Search by Profession"
              query={profession}
              setQuery={setProfession}
              onSearch={() => applyFilters()} // Trigger filtering when searching
            />
          </View>
        </View>
      </Animated.View>
    </>
  );

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
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={({ item }) => <UsersCard user={item} />}
          ListHeaderComponent={headerComponent()}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-100 text-lg">No data available</Text>
            </View>
          )}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          refreshing={refreshing}
          onScroll={handleScroll}
        />
      )}
    </SafeAreaView>
  );
};

export default People;

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: '#161622',
    zIndex: 1,
    elevation: 2,
    paddingHorizontal: 10,
    paddingTop: 10,
    overflow: 'hidden',
  },
});
