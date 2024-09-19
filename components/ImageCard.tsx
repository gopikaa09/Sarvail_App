import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Share, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { truncateHtml } from '@/hooks/useTruncate';
import Icons from 'react-native-vector-icons/AntDesign';
import YoutubePlayer from "react-native-youtube-iframe";
import { icons } from '@/constants';
const ImageCard = ({ item, isVisible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter();

  const truncatedContent = truncateHtml(item?.post_content, 150);
  function getYoutubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  }

  const videoId = getYoutubeVideoId(item?.videos?.[0]?.td_video);
  console.log(videoId);

  // const videoId = item?.videos?.[0]?.td_video?.split("v=")[1]

  useEffect(() => {
    if (isVisible) {
      setIsPlaying(true);  // Play the video when it's visible
    } else {
      setIsPlaying(false);  // Stop the video when it's out of view
    }
  }, [isVisible]);

  const handlePress = () => {
    router.push(`/details/${item.ID}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `${item?.guid}` });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex flex-col px-4 mb-0" key={item?.ID}>
      {item?.videos?.length !== 0 ? (
        <YoutubePlayer
          height={200}
          width={330}
          play={isPlaying}
          videoId={videoId}
          volume={100}  // Ensure the sound is enabled
          onChangeState={(state) => {
            if (state === "ended") {
              setIsPlaying(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
          <Image
            source={{ uri: item?.featured_image?.medium_large }}
            className="w-full h-48 rounded-xl mt-3"
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handlePress}>
        <View className="ml-0 mt-2 text-base">
          <Text className="font-psemibold text-lg text-white leading-6" numberOfLines={2}>
            {item?.post_title}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex flex-row justify-between">
        <Text className="text-gray-400 text-sm">{new Date(item?.post_date).toLocaleDateString()}</Text>
        <View className='bg-slate-500'>
          <Icons name="sharealt" size={15} color="white" onPress={handleShare} />
        </View>
      </View>

      <Text className="bg-secondary-100 text-slate-50 p-1 px-1.5 rounded-3xl font-semibold self-start my-0 text-xs absolute top-5 left-6 opacity-80">
        {item?.categories[0]?.name}
      </Text>

      <View className="border-t border-gray-50 mt-2 opacity-60" />
    </View>
  );
};


export default ImageCard;
