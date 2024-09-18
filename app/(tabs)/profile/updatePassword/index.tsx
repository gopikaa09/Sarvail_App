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
  const [updating, setUpdating] = useState(false)
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
    // Check if both fields are empty
    if (!form.update_password || !form.confirm_password) {
      Alert.alert("Error", "Please enter the new password and confirm it.");
      return;
    }

    // Check if passwords match
    if (form.update_password !== form.confirm_password) {
      Alert.alert("Error", "Passwords do not match. Please try again.");
      return;
    }

    // Optionally, check password strength/length (example: min 8 characters)
    if (form.update_password.length < 8) {
      Alert.alert("Error", "Password should be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true); // Set submitting state
    setUpdating(true);     // Set updating state

    try {
      const response = await axios.post(
        'https://sarvail.net/wp-json/ds-custom_endpoints/v1/me/update_password',
        { password: form.update_password },
        {
          headers: {
            "Api-Token": `Bearer ${user.token}`
          }
        }
      );

      if (response.status === 200) {
        showToast("Password Updated Successfully");
        router.back(); // Navigate back after successful update
      } else {
        // Handle any non-200 responses
        Alert.alert("Error", "Failed to update password. Please try again.");
      }
    } catch (err) {
      // Catch any errors from the API request
      Alert.alert("Error", "An error occurred while updating the password.");
    } finally {
      setIsSubmitting(false); // Reset submitting state
      setUpdating(false);     // Reset updating state
    }
  };

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
            placeholder="Enter Password.."
          />
          <FormField
            title="Confirm Password"
            value={form.confirm_password}
            handleChangeText={(e) => setForm({
              ...form,
              confirm_password: e,
            })}
            otherStyles="mt-7"
            placeholder="Enter Password.."
          />
          <CustomButton
            title="Update Password"
            handlePress={submit}
            isLoading={isSubmitting}
            containerStyles="mt-7"
            isLoading={updating}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
