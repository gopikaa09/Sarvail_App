import CustomButton from '@/components/CustomButton';
import FormField from '@/components/FormField';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Entypo';
import SimpleStore from 'react-native-simple-store';
import showToast from '@/components/utils/showToast';


export default function PersonalDetailsUpdate() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    ds_gender: '',
    ds_res_mobile: '',
    ds_batch: '',
    user_email: '',
    ds_res_address: '',
    ds_res_country: '',
    ds_res_state: '',
    ds_res_city: '',
    ds_res_pin: ''
  })
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
          first_name: userData.user_meta.first_name || '',
          last_name: userData.user_meta.last_name || '',
          ds_batch: userData.user.ds_batch || '',
          user_email: userData.user.user_email || '',
          ds_res_mobile: userData.user_meta.ds_res_mobile || '',
          ds_gender: userData.user_meta.ds_gender || '',
          ds_res_address: userData.user_meta.ds_res_address || '',
          ds_res_country: userData.user_meta.ds_res_country || '',
          ds_res_state: userData.user_meta.ds_res_state || '',
          ds_res_city: userData.user_meta.ds_res_city || '',
          ds_res_pin: userData.user_meta.ds_res_pin || ''
        });
      } else {
        console.warn('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdate = async () => {
    const queryParams = new URLSearchParams({
      first_name: form.first_name,
      last_name: form.last_name,
      ds_gender: form.ds_gender,
      ds_res_mobile: form.ds_res_mobile,
      ds_batch: form.ds_batch,
      user_email: form.user_email,
      ds_res_address: form.ds_res_address,
      ds_res_country: form.ds_res_country,
      ds_res_state: form.ds_res_state,
      ds_res_city: form.ds_res_city,
      ds_res_pin: form.ds_res_pin
    }).toString();
    setUpdating(true)
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
        showToast('Profile updated successfully');
        const updatedUser = response.data;
        console.log(updatedUser);
        setUser(updatedUser);
        await SimpleStore.update('user', updatedUser);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile', error);
      Alert.alert('Error', 'An error occurred while updating the profile');
    } finally {
      setUpdating(false)
    }
  };
  const handleBackStep = () => {
    router.push('/profile');
  };
  return (
    <KeyboardAvoidingView className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : ''}
    >
      <SafeAreaView className='bg-primary h-full'>
        {
          loading ?
            <View className='flex-1 h-full items-center justify-center'>
              <ActivityIndicator color="#fff" size="large" />
            </View> :
            <ScrollView bounces={false}>
              <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
                <View className="self-start bg-gray-600 opacity-60 p-2 rounded-3xl relative -top-4">
                  <Icons name="chevron-left" size={20} color="white" onPress={handleBackStep} />
                </View>
                <Text className='text-white text-xl'>Update Personal Details</Text>
                <FormField
                  title="First Name"
                  value={form.first_name}
                  handleChangeText={(e) => setForm({ ...form, first_name: e })}
                  otherStyles="mt-7"
                  placeholder="Last Name"
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
                  placeholder="Email"
                />
                <FormField
                  title="Gender"
                  value={form.ds_gender}
                  handleChangeText={(e) => setForm({ ...form, ds_gender: e })}
                  otherStyles="mt-7"
                  placeholder="Gender"
                />
                <FormField
                  title="Mobile Number"
                  value={form.ds_res_mobile}
                  handleChangeText={(e) => setForm({ ...form, ds_res_mobile: e })}
                  otherStyles="mt-7"
                  placeholder="Mobile Number"
                />
                <FormField
                  title="Batch"
                  value={form.ds_batch}
                  handleChangeText={(e) => setForm({ ...form, ds_batch: e })}
                  otherStyles="mt-7"
                  placeholder="Batch"
                />
                <FormField
                  title="Address"
                  value={form.ds_res_address}
                  handleChangeText={(e) => setForm({ ...form, ds_res_address: e })}
                  otherStyles="mt-7"
                  placeholder="Address"
                />
                <FormField
                  title="Country"
                  value={form.ds_res_country}
                  handleChangeText={(e) => setForm({ ...form, ds_res_country: e })}
                  otherStyles="mt-7"
                  placeholder="Country"
                />
                <FormField
                  title="State"
                  value={form.ds_res_state}
                  handleChangeText={(e) => setForm({ ...form, ds_res_state: e })}
                  otherStyles="mt-7"
                  placeholder="State"
                />
                <FormField
                  title="City"
                  value={form.ds_res_city}
                  handleChangeText={(e) => setForm({ ...form, ds_res_city: e })}
                  otherStyles="mt-7"
                  placeholder="City"
                />
                <FormField
                  title="Zip Code"
                  value={form.ds_res_pin}
                  handleChangeText={(e) => setForm({ ...form, ds_res_pin: e })}
                  otherStyles="mt-7"
                  placeholder="Zip Code"
                />
                <CustomButton
                  title="Update"
                  isLoading={updating}
                  handlePress={handleUpdate} // Add the update handler
                  containerStyles="mt-7 px-5 min-h-[50px]"
                />
              </View>
            </ScrollView>
        }
      </SafeAreaView>
    </KeyboardAvoidingView>


  );
}