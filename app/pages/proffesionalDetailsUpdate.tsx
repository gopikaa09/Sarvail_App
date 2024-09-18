import CustomButton from '@/components/CustomButton';
import FormField from '@/components/FormField';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { View, Text, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Entypo';
import SimpleStore from 'react-native-simple-store';
import axios from 'axios';
import showToast from '@/components/utils/showToast';

export default function ProfessionalDetailsUpdate() {
  const [form, setForm] = useState({
    ds_profession: '',
    ds_specialization: '',
    ds_designation: '',
    ds_organization: '',
    ds_off_mobile: '',
    ds_off_address: '',
    ds_country: '',
    ds_state: '',
    ds_city: '',
    ds_pin: ''
  })
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

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
        console.log(userData);
        setForm({
          ds_profession: userData.user_meta.ds_profession || '',
          ds_specialization: userData.user_meta.ds_specialization || '',
          ds_designation: userData.user_meta.ds_designation || '',
          ds_organization: userData.user_meta.ds_organization || '',
          ds_off_mobile: userData.user_meta.ds_off_mobile || '',
          ds_off_address: userData.user_meta.ds_off_address || '',
          ds_country: userData.user_meta.ds_country || '',
          ds_state: userData.user_meta.ds_state || '',
          ds_city: userData.user_meta.ds_city || '',
          ds_pin: userData.user_meta.ds_pin || ''

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
      ds_profession: form.ds_profession,
      ds_specialization: form.ds_specialization,
      ds_designation: form.ds_designation,
      ds_organization: form.ds_organization,
      ds_off_mobile: form.ds_off_mobile,
      ds_off_address: form.ds_off_address,
      ds_country: form.ds_country,
      ds_state: form.ds_state,
      ds_city: form.ds_city,
      ds_pin: form.ds_pin
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
        showToast("Profile updated successfully")
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
        <ScrollView bounces={false}>
          <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
            <View className="self-start bg-gray-600 opacity-60 p-2 rounded-3xl relative -top-9">
              <Icons name="chevron-left" size={20} color="white" onPress={handleBackStep} />
            </View>
            <Text className='text-white text-xl'>Update Professional Details</Text>
            <FormField
              title="Profession"
              value={form.ds_profession}
              handleChangeText={(e) => setForm({ ...form, ds_profession: e })}
              otherStyles="mt-7"
              placeholder="Profession"
            />
            <FormField
              title="Specilization"
              value={form.ds_specialization}
              handleChangeText={(e) => setForm({ ...form, ds_specialization: e })}
              otherStyles="mt-7"
              placeholder="Specilization"
            />
            <FormField
              title="Designation"
              value={form.ds_designation}
              handleChangeText={(e) => setForm({ ...form, ds_designation: e })}
              otherStyles="mt-7"
              placeholder="Designation"
            />
            <FormField
              title="Organization"
              value={form.ds_organization}
              handleChangeText={(e) => setForm({ ...form, ds_organization: e })}
              otherStyles="mt-7"
              placeholder="Organization"
            />
            <FormField
              title="Mobile Number"
              value={form.ds_off_mobile}
              handleChangeText={(e) => setForm({ ...form, ds_off_mobile: e })}
              otherStyles="mt-7"
              placeholder="Mobile Number"
            />
            <FormField
              title="Address"
              value={form.ds_off_address}
              handleChangeText={(e) => setForm({ ...form, ds_off_address: e })}
              otherStyles="mt-7"
              placeholder="Address"
            />
            <FormField
              title="Country"
              value={form.ds_country}
              handleChangeText={(e) => setForm({ ...form, ds_country: e })}
              otherStyles="mt-7"
              placeholder="Country"
            />
            <FormField
              title="State"
              value={form.ds_state}
              handleChangeText={(e) => setForm({ ...form, ds_state: e })}
              otherStyles="mt-7"
              placeholder="State"
            />
            <FormField
              title="City"
              value={form.ds_city}
              handleChangeText={(e) => setForm({ ...form, ds_city: e })}
              otherStyles="mt-7"
              placeholder="Batch"
            />
            <FormField
              title="Zip Code"
              value={form.ds_pin}
              handleChangeText={(e) => setForm({ ...form, ds_pin: e })}
              otherStyles="mt-7"
              placeholder="Zip Code"
            />
            <CustomButton
              title="Update"
              handlePress={handleUpdate} // Add the update handler
              containerStyles="mt-7 px-5 min-h-[50px]"
            />

          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
