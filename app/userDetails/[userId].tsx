import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SimpleStore from 'react-native-simple-store';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icons from 'react-native-vector-icons/Entypo'
import { icons } from '@/constants';
import YoutubePlayer from 'react-native-youtube-iframe'
const { width } = Dimensions.get('window');

export default function PeopleDetails() {
  const { userId } = useLocalSearchParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const [routes] = useState([
    { key: 'personal', title: 'Personal Details' },
    { key: 'professional', title: 'Professional Details' },
  ]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedUser = await SimpleStore.get('user');
        if (storedUser && storedUser.token) {
          setToken(storedUser.token);
        }
      } catch (err) {
        console.error('Error fetching token:', err);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const response = await fetch(`https://sarvail.net/wp-json/ds-custom_endpoints/v1/users?id=${userId}`, {
          method: 'GET',
          headers: {
            'Api-Token': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  const handleBackStep = () => {
    router.push('people');
  };

  const PersonalDetails = () => (
    <View style={styles.tabContainer}>
      <Text style={styles.tabText}>First Name: {userData?.user_meta?.first_name}</Text>
      <Text style={styles.tabText}>Last Name: {userData?.user_meta?.last_name}</Text>
      <Text style={styles.tabText}>Batch: {userData?.user?.ds_batch}</Text>
      <Text style={styles.tabText}>Email: {userData?.user?.user_email}</Text>
      <Text style={styles.tabText}>Mobile: {userData?.user_meta?.ds_res_mobile}</Text>
      <Text style={styles.tabText}>Blood Group: {userData?.user_meta?.ds_blood_group}</Text>
      <Text style={styles.tabText}>Gender: {userData?.user_meta?.ds_gender}</Text>
      <Text style={styles.tabText}>Lives In: {userData?.user_meta?.ds_lives_in}</Text>
      {userData?.user_meta?.ds_res_address && (
        <Text style={[styles.tabText, styles.addressText]}>
          Address: {userData?.user_meta?.ds_res_address}, {userData?.user_meta?.ds_res_city}, {userData?.user_meta?.ds_res_state}, {userData?.user_meta?.ds_res_pin}
        </Text>
      )}
    </View>
  );

  const ProfessionalDetails = () => (
    <View style={styles.tabContainer}>
      <Text style={styles.tabText}>First Name: {userData?.user_meta?.first_name}</Text>
      <Text style={styles.tabText}>Last Name: {userData?.user_meta?.last_name}</Text>
      <Text style={styles.tabText}>Batch: {userData?.user?.ds_batch}</Text>
      <Text style={styles.tabText}>Profession: {userData?.user?.ds_profession}</Text>
      <Text style={styles.tabText}>Email: {userData?.user?.user_email}</Text>
      <Text style={styles.tabText}>Mobile: {userData?.user_meta?.ds_off_mobile}</Text>
      {userData?.user_meta?.ds_res_address && (
        <Text style={[styles.tabText, styles.addressText]}>
          Address: {userData?.user_meta?.ds_res_address}, {userData?.user_meta?.ds_res_city}, {userData?.user_meta?.ds_res_state}, {userData?.user_meta?.ds_res_pin}
        </Text>
      )}
    </View>
  );

  const renderScene = SceneMap({
    personal: PersonalDetails,
    professional: ProfessionalDetails,
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View className='bg-gray-600 opacity-60 p-2 rounded-3xl absolute self-start m-2'>
            <Icons name="chevron-left" className="bg-slate-600 p-3 self-start" size={20} color="white" onPress={handleBackStep} />
          </View>
          <Image
            source={{ uri: userData?.user?.ds_profile_pic || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <Text style={styles.userNameText}>
            {userData?.user_meta?.first_name} {userData?.user_meta?.last_name}
          </Text>
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width }}
          renderTabBar={props => (
            <TabBar
              {...props}
              style={styles.tabBar}
              indicatorStyle={styles.tabBarIndicator}
            />
          )}
        />
      </SafeAreaView>
      {/* <YoutubePlayer
        height={200}
        width={300}
        play={true}
        videoId={'9jSjhsI8M2o'}
      /> */}
      <StatusBar backgroundColor='#161622' style='light' />
    </>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  backgroundImageContainer: {
    backgroundColor: '#E5E7EB',
    height: 128,
    width: '100%',
    position: 'absolute',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 60,
    position: 'relative',
    top: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  avatarText: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  userNameText: {
    color: '#FFFFFF',
    marginTop: 24,
    fontSize: 20,
  },
  tabContainer: {
    padding: 16,
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginVertical: 4,
  },
  addressText: {
    lineHeight: 22,
  },
  tabBar: {
    backgroundColor: '#1E293B',
  },
  tabBarIndicator: {
    backgroundColor: '#FF9C01',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161622',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
