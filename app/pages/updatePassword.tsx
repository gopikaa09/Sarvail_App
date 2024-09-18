import CustomButton from '@/components/CustomButton';
import FormField from '@/components/FormField';
import showToast from '@/components/utils/showToast';
import axios from 'axios';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import SimpleStore from 'react-native-simple-store';

export default function UpdatePassword() {
  const [form, setForm] = useState({
    update_password: '',
    confirm_password: ''
  })
  const [user, setUser] = useState(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async () => {
    if (form.update_password === form.confirm_password) {
      try {
        const response = await axios.post('https://sarvail.net/wp-json/ds-custom_endpoints/v1/me/update_password',
          {
            password: form.update_password
          },
          {
            headers: {
              "Api-Token": `Bearer ${user.token}`
            }
          }
        )
        if (response.status === 200) {
          showToast("Password Updated Successfully")
          router.back()
        }
      } catch (err) {
        Alert.alert("error", "")
      }
    }
  }
  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
          <Text className='text-white text-xl'>Update Password</Text>
          <FormField
            title="Password"
            value={form.update_password}
            handleChangeText={(e) => setForm({
              ...form,
              update_password: e,
            })}
            otherStyles="mt-7"
            keyboardType='email-address'
            placeholder="Enter Email.."
          />
          <FormField
            title="Confirm Password"
            value={form.confirm_password}
            handleChangeText={(e) => setForm({
              ...form,
              confirm_password: e,
            })}
            otherStyles="mt-7"
            placeholder="Enter Password"
            secureTextEntry={true}
          />
          <CustomButton
            title="Update Password"
            handlePress={submit}
            isLoading={isSubmitting}
            containerStyles="mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
