import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { images } from '@/constants';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import jwtDecode from "jwt-decode";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GlobalProvider, { useGlobalContext } from '@/context/GloberProvider'; // Adjust the path accordingly

const queryClient = new QueryClient();

export default function App() {
  const router = useRouter();
  const { user, isLogged, setUser } = useGlobalContext(); // Access global functions

  console.log('====================================');
  console.log("index", user);
  console.log('====================================');
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        if (isLogged) {
          const decoded = jwtDecode(user.token);
          const currentDate = new Date();
          const expiryDate = new Date(decoded?.exp * 1000);
          if (expiryDate < currentDate) {
            console.log("Token expired");
            router.replace('/sign-in');
          } else if (expiryDate > currentDate && isLogged) {
            setUser(user)
            console.log("Token active");
            router.replace('/home');
          }
        }
      } catch (error) {
        console.error('Failed to fetch login status', error);
      }
    };
    checkLoginStatus();
  }, [router]);

  const handlePassword = () => {
    router.push('/sign-in');
  };

  const handleOTP = () => {
    router.push('/otpLoginConfirm');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className='bg-primary'>
        <View className='items-center justify-center h-full'>
          <Image source={images.sarvailLogo} className='w-44 h-56' />
          <CustomButton
            title="Login With Password"
            handlePress={handlePassword}
            containerStyles="w-[240px] mt-6"
          />
          <CustomButton
            title="Login with OTP"
            handlePress={handleOTP}
            containerStyles="w-[240px] mt-6"
          />
        </View>
      </SafeAreaView>
    </QueryClientProvider>
  );
}
