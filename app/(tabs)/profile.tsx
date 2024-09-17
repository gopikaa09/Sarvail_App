import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View, RefreshControl, ToastAndroid } from 'react-native';
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
        Alert.alert('Error', 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture', error);
      Alert.alert('Error', 'An error occurred while updating the profile picture');
    } finally {
      setUploading(false)
    }
  };

  const handleUpdate = async () => {
    const queryParams = new URLSearchParams({
      first_name: form.first_name,
      last_name: form.last_name,
      ds_batch: form.ds_batch,
      ds_res_mobile: form.ds_res_mobile,
      user_email: form.user_email,
      country_code: form.country_code,
      password: form.password,
      ds_profession: form.ds_profession,
    }).toString();

    try {
      const response = await axios.post(
        `https://www.sarvail.net/wp-json/ds-custom_endpoints/v1/me?${queryParams}`,
        {},
        {
          headers: {
            'Api-Token': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        const updatedUser = response.data;
        setUser(updatedUser);
        setForm({
          ...form,
          first_name: updatedUser.user_meta.first_name,
          last_name: updatedUser.user_meta.last_name,
          ds_batch: updatedUser.user.ds_batch,
          ds_res_mobile: updatedUser.user_meta.ds_res_mobile,
          country_code: updatedUser.user_meta.country_code,
          ds_profession: updatedUser.user_meta.ds_profession,
          ds_profile_pic: updatedUser.user.ds_profile_pic
        });
        await SimpleStore.update('user', updatedUser);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile', error);
      Alert.alert('Error', 'An error occurred while updating the profile');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
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

  return (
    <SafeAreaView className='bg-primary flex-1'>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
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

            <View className='absolute left-14 top-20 bg-black-100 rounded-2xl p-0.5 flex items-center justify-center'>
              <View className='mb-1'>
                <Icons name="pencil" size={20} color="white" onPress={openPicker} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <Text className='text-white font-semibold text-lg my-2'>{form.first_name} {form.last_name}</Text>
        <TouchableOpacity onPress={handleLogout}
          activeOpacity={0.7}
          className='absolute right-10'
        >
          <Icon2 name="logout" size={20} color="white" />
        </TouchableOpacity>

        <FormField
          title="First Name"
          value={form.first_name}
          handleChangeText={(e) => setForm({ ...form, first_name: e })}
          otherStyles="mt-7"
          placeholder="First Name"
        />
        <FormField
          title="Last Name"
          value={form.last_name}
          handleChangeText={(e) => setForm({ ...form, last_name: e })}
          otherStyles="mt-7"
          placeholder="Last Name"
        />
        <FormField
          title="Email"
          value={form.user_email}
          handleChangeText={(e) => setForm({ ...form, user_email: e })}
          otherStyles="mt-7"
          isEditable={false}
          keyboardType='email-address'
          placeholder="Enter Email.."
        />
        <FormField
          title="Batch"
          value={form.ds_batch}
          handleChangeText={(e) => setForm({ ...form, ds_batch: e })}
          otherStyles="mt-7"
          placeholder="Enter Batch.."
        />
        <FormField
          title="Profession"
          value={form.ds_profession}
          handleChangeText={(e) => setForm({ ...form, ds_profession: e })}
          otherStyles="mt-7"
          placeholder="Enter Profession.."
        />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }} className='mb-4'>
          <CustomButton
            title="Update"
            handlePress={handleUpdate} // Add the update handler
            containerStyles="mt-7 px-5 min-h-[50px]"
          />
          <CustomButton
            title="Log Out"
            handlePress={handleLogout}
            containerStyles="bg-white mt-7 px-5 py-2 min-h-[50px]"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
