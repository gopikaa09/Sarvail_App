import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View, RefreshControl, ToastAndroid, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Icons from 'react-native-vector-icons/EvilIcons';
import * as ImagePicker from 'expo-image-picker';
import SimpleStore from 'react-native-simple-store';
import Icon2 from 'react-native-vector-icons/MaterialIcons'
import showToast from '@/components/utils/showToast';
import { FlatList } from 'react-native-gesture-handler';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false)
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    ds_profile_pic: '',
    first_name: '',
    last_name: '',
    ds_batch: '',
    user_email: '',
    ds_res_mobile: '',
    country_code: '',
    password: '',
    ds_profession: ''
  });
  const [token, setToken] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const User = await SimpleStore.get('user');
      const storedToken = User?.token;
      if (!storedToken) {
        console.warn('No token found in SimpleStore');
        return;
      }

      setToken(storedToken);
      const response = await axios.get('https://sarvail.net/wp-json/ds-custom_endpoints/v1/me', {
        headers: {
          'Api-Token': `Bearer ${storedToken}`,
        },
      });

      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        setForm({
          username: userData.user.user_nicename || '',
          first_name: userData.user_meta.first_name || '',
          last_name: userData.user_meta.last_name || '',
          ds_batch: userData.user.ds_batch || '',
          user_email: userData.user.user_email || '',
          ds_res_mobile: userData.user_meta.ds_res_mobile || '',
          country_code: userData.user_meta.country_code || '',
          password: '',
          ds_profile_pic: userData.user.ds_profile_pic || '',
          ds_profession: userData.user_meta.ds_profession || ''
        });
      } else {
        console.warn('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const defaultImage = 'https://via.placeholder.com/150';

  const handleLogout = async () => {
    await SimpleStore.save('loggedIn', false);
    await SimpleStore.save('user', {});
    await SimpleStore.save('token', '');
    showToast("Logged out successfully")
    router.replace('/sign-in');
  };

  const openPicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      uploadProfilePicture(uri);
    } else {
      Alert.alert('Cancelled', 'Image picking was cancelled');
    }
  };

  const uploadProfilePicture = async (imageUri) => {
    setUploading(true)
    try {
      const formData = new FormData();
      formData.append('ds_profile_pic', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      });

      const response = await axios.post(
        'https://sarvail.net/wp-json/ds-custom_endpoints/v1/me',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Api-Token': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const userData = response.data;
        setForm({
          ...form,
          ds_profile_pic: userData.user.ds_profile_pic || '',
        });
        setUser(userData);
        showToast("Profile Picture Updated Sucessfully")
      } else {
        showToast('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture', error);
      Alert.alert('Error', 'An error occurred while updating the profile picture');
    } finally {
      setUploading(false)
    }
  };

  if (loading) {
    return (
      <SafeAreaView className='bg-primary flex-1'>
        <View className='flex-1 justify-center items-center'>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    );
  }
  const ListData = [
    { id: 1, title: "Personal Details", route: '/profile/personal' },
    { id: 2, title: "Professional Details", route: '/profile/professional' },
    { id: 3, title: "Update Password", route: '/profile/updatePassword' },

  ]
  const handleItemPress = (item) => {
    router.replace(item?.route)
  }

  return (
    <SafeAreaView className='flex-1 bg-primary'>
      <View className='items-center my-10'>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {
            uploading ? (
              <>
                <View className='absolute left-8 top-12'>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
                <Image
                  source={{ uri: user?.user?.ds_profile_pic || defaultImage }}
                  style={{ width: 80, height: 80 }}
                  className="rounded-full mt-3 relative opacity-30"
                  resizeMode="cover"
                />
              </>
            ) : (
              <>
                <Image
                  source={{ uri: user?.user?.ds_profile_pic || defaultImage }}
                  style={{ width: 80, height: 80 }}
                  className="rounded-full mt-3"
                  resizeMode="cover"
                />
              </>
            )
          }
          <View className='absolute left-14 top-14 bg-black-100 rounded-2xl p-0.5 flex items-center justify-center'>
            <View className='mb-1'>
              <Icons name="pencil" size={20} color="white" onPress={openPicker} />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{form.first_name} {form.last_name}</Text>
      </View>
      <TouchableOpacity onPress={handleLogout}
        activeOpacity={0.7}
        className='absolute right-10 top-10'
      >
        <Icon2 name="logout" size={20} color="white" />
      </TouchableOpacity>
      <FlatList
        data={ListData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={1}
          >
            <View className='flex flex-row items-center justify-between space-x-4 w-full h-12 px-4 my-2 bg-black-100 rounded-xl border-2 border-black-200'>
              <Text style={styles.listItemText}>{item.title}</Text>

              <Pressable onPress={() => router.push(item.route)}>
                <Icons name="chevron-right" size={20} color="white" />
              </Pressable>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
      {/* <View className='flex-1 justify-center items-center'>
        <CustomButton
          title="Log Out"
          handlePress={handleLogout} // Add the update handler
          containerStyles="mt-7 px-5 min-h-[50px] w-32 mb-36"
        />
      </View> */}
    </SafeAreaView>
  );
};

export default Profile;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImageUploading: {
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
  },
  uploadingContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  editIconContainer: {
    position: 'absolute',
    left: 46,
    top: 32,
    backgroundColor: 'black',
    borderRadius: 50,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  logoutButton: {
    position: 'absolute',
    right: 10,
    top: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: '#161622',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  listItemText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});
