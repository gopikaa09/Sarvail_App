import React, { useCallback, useState } from 'react';
import { Alert, Image, Share, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { truncateHtml } from '@/hooks/useTruncate';
import Icons from 'react-native-vector-icons/AntDesign';
import YoutubePlayer from "react-native-youtube-iframe";
import { icons } from '@/constants';

const ImageCard = ({ item, isScrolling, isVisible }) => {
  const [isPlaying, setIsPlaying] = useState(false); // Track video play state
  const [hasClickedImage, setHasClickedImage] = useState(false); // Track whether image has been clicked
  const router = useRouter();

  const truncatedContent = truncateHtml(item?.post_content, 150);

  const handlePress = () => {
    router.push(`/details/${item.ID}`);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${item?.guid}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const formattedDate = new Date(item?.post_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // const videoId = item?.videos?.[0]?.td_video?.split("v=")[1]; // Extract video ID from URL

  const handleImageClick = () => {
    setHasClickedImage(true); // Set flag to true when image is clicked
    setIsPlaying(true); // Start playing the video
  };

  const handlePLay = useCallback((state) => {
    if (state === "ended") {
      setIsPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  return (
    <View className="flex flex-col px-4 mb-4" key={item?.ID}>
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          {/* Avatar or additional content */}
        </View>
        {/* Optional menu icon or other elements */}
      </View>
      {isPlaying ? (
        <YoutubePlayer
          height={200}
          width={300}
          play={isPlaying}
          videoId={'9jSjhsI8M2o'}
          onChangeState={handlePLay}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPlaying(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: item?.featured_image?.medium_large }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handlePress}>
        <View className="ml-0 mt-2">
          <Text className="font-psemibold text-lg text-white leading-6" numberOfLines={2}>
            {item?.post_title}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex flex-row justify-between">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-gray-400 text-sm">{formattedDate}</Text>
        </View>
        <View className="flex flex-row justify-between my-1">
          <Icons name="sharealt" size={15} color="white" onPress={handleShare} />
        </View>
      </View>

      <Text className="bg-secondary-100 text-slate-50 p-1.5 rounded-3xl font-semibold self-start my-0 text-xs absolute top-4 left-6 opacity-80">
        {item?.categories[0]?.name}
      </Text>

      <View className="border-t border-gray-50 mt-2" />
    </View>
  );
};

export default ImageCard;
