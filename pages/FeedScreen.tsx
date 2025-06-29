import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';

export const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://192.168.1.24:3002/getadminposts');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error('Failed to load posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = dateString => {
    if (!dateString) return 'Date & Time';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const renderPost = ({ item }) => {
    const hasImage = item.adminimagepost !== null && item.adminimagepost !== undefined;
    const imageUrl = hasImage 
      ? `http://192.168.1.24:3002/adminpost/image/${item._id}`
      : null;
  
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image
            source={item.adminprofileimage 
              ? { uri: item.adminprofileimage } 
              : require('../assets/user1.png')}
            style={styles.profileImage}
          />
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>
              {item.adminpostusername || 'Admin'}
            </Text>
            <Text style={styles.postDate}>
              {formatDate(item.postedAt)}
            </Text>
          </View>
        </View>
        
        {/* Description with conditional bottom padding */}
        <Text style={[
          styles.postDescription,
          !hasImage && styles.postDescriptionNoImage
        ]}>
          {item.adminpostdescription || ''}
        </Text>
  
        {/* Image container only if image exists */}
        {hasImage && (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.postImage}
              resizeMode="cover"
              onError={(e) => console.log('Failed to load image:', e.nativeEvent.error)}
            />
          </View>
        )}
      </View>
    );
  };
  
  

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={fetchPosts}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.noPostsText}>
              {refreshing ? 'Refreshing...' : 'No posts available.'}
            </Text>
          )
        }
        ListHeaderComponent={
          loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#007BFF" />
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
  },
  loaderContainer: {
    paddingVertical: 30,
  },
  postContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  usernameContainer: {
    flexDirection: 'column',
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  postDescription: {
    fontSize: 15,
    color: '#444',
    paddingHorizontal: 16,
    marginBottom: 12, // Default margin when image exists
    lineHeight: 22,
  },
  postDescriptionNoImage: {
    marginBottom: 16, // Different margin when no image
    paddingBottom: 16, // Extra padding when no image
  },
  imageWrapper: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5,
    backgroundColor: '#f0f0f0',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  noPostsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  
});

export default FeedScreen;