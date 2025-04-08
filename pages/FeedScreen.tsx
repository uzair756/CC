import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';

export const FeedScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://3.0.218.176:3002/getadminposts');
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts || []);
        } else {
          console.error('Failed to load posts');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
      setLoading(false); // Set loading to false once posts are fetched
    };

    fetchPosts();
  }, []);

  // Helper function to format the date in a user-friendly format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short', // "Mon"
      year: 'numeric', // "2024"
      month: 'short', // "Dec"
      day: 'numeric', // "16"
      hour: 'numeric', // "5"
      minute: 'numeric', // "30"
      second: 'numeric', // "10"
      hour12: true, // "AM/PM"
    });
  };

  const renderPost = ({ item }) => {
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={require('../assets/user1.png')} style={styles.profileImage} />
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{item.adminpostusername || 'Username'}</Text>
            <Text style={styles.postDate}>
              {item.postedAt ? formatDate(item.postedAt) : 'Date & Time'}
            </Text>
          </View>
        </View>
        <Text style={styles.postDescription}>{item.adminpostdescription}</Text>
        {item.adminimagepost && (
          <Image source={{ uri: item.adminimagepost }} style={styles.postImage} />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<Text style={styles.noPostsText}>No posts available.</Text>}
      ListHeaderComponent={
        loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007BFF" />
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100, // Limit the height to fit the loading indicator
  },
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingTop: 0,
    marginTop: 0,
    width: '100%',
  },
  postContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 0,
    width: '100%',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  usernameContainer: {
    flexDirection: 'column',
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  postDate: {
    fontSize: 13,
    color: '#888',
  },
  postDescription: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
    lineHeight: 22,
  },
  postImage: {
    width: '100%',
    height: 450,
    borderRadius: 0,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  noPostsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
