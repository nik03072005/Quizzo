import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [schoolIdImage, setSchoolIdImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'details' | 'upload'>('phone'); // Multi-step registration
  
  // Image editing states
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [uploadRetryCount, setUploadRetryCount] = useState(0);
  
  const { sendRegistrationOTP, register } = useAuth();

  // Popular country codes
  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
  ];

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your phone number'
      });
      return;
    }

    const fullPhoneNumber = countryCode + phoneNumber;

    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(fullPhoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // First check if phone number is available
      const checkResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/check-phone-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
      });

      const checkResult = await checkResponse.json();
      
      if (!checkResult.available) {
        Alert.alert(
          'Account Exists',
          'An account with this phone number already exists. Would you like to login instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/(auth)/login') }
          ]
        );
        return;
      }

      // Store the full phone number for later use
      setPhoneNumber(fullPhoneNumber);
      
      // If phone is available, send OTP
      await sendRegistrationOTP(fullPhoneNumber);
      setStep('otp');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP sent to your phone number'
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
      console.error('Send OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndNext = () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    setStep('details');
  };

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    // Only validate email if it's provided (since it's optional)
    if (email && email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setStep('upload');
  };

  const handleCameraPick = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.');
        return;
      }
      await openCamera();
    } catch (error) {
      Alert.alert('Error', 'Failed to access camera');
      console.error('Camera permission error:', error);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library permissions to select an image.');
        return;
      }
      await openLibrary();
    } catch (error) {
      Alert.alert('Error', 'Failed to access photo library');
      console.error('Gallery permission error:', error);
    }
  };

  const openCamera = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false, // Don't include EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error('Camera error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openLibrary = async () => {
    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
        exif: false, // Don't include EXIF data
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from library');
      console.error('Library error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // File size validation
  const validateImageFile = async (asset: any): Promise<{valid: boolean, error?: string}> => {
    try {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      // Get file info to check size
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > maxSize) {
        return {
          valid: false,
          error: 'Image size must be less than 5MB. Please choose a smaller image or use the crop feature.'
        };
      }

      // Basic URI validation
      if (!asset.uri || !asset.uri.startsWith('file://')) {
        return {
          valid: false,
          error: 'Invalid image file. Please try selecting the image again.'
        };
      }

      return { valid: true };
    } catch (validationError) {
      console.error('File validation error:', validationError);
      return {
        valid: false,
        error: 'Failed to validate image file. Please try again.'
      };
    }
  };

  const processSelectedImage = async (asset: any) => {
    try {
      console.log('Processing image:', asset.uri);
      
      // Validate file size and format
      const validation = await validateImageFile(asset);
      if (!validation.valid) {
        Alert.alert('Invalid Image', validation.error);
        return;
      }

      // OPTION 1: Direct upload without editor (uncomment to use)
      await uploadDirectly(asset);
      return; // Exit early - no editor needed
      
      // OPTION 2: Show full-screen native-style editor (current implementation)
      setEditedImage(asset.uri);
      setRotation(0);
      setUploadRetryCount(0);
      setShowImageEditor(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
      console.error('Image processing error:', error);
    }
  };

  // Option 1: Direct upload function
  const uploadDirectly = async (asset: any) => {
    try {
      setIsLoading(true);
      
      const uploadAsset = {
        uri: asset.uri,
        type: 'image/jpeg',
        fileName: `school-id-${Date.now()}.jpg`,
      };
      
      const uploadResult = await uploadSchoolIdWithRetry(uploadAsset);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        setSchoolIdImage(uploadResult.imageUrl);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'School ID uploaded successfully!'
        });
      } else {
        Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Direct upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Image editing functions
  const handleRotateImage = async () => {
    if (!editedImage || isImageProcessing) return;
    
    try {
      setIsImageProcessing(true);
      const newRotation = rotation + 90;
      setRotation(newRotation);
      
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        editedImage,
        [{ rotate: 90 }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Validate the manipulated image
      const validation = await validateImageFile(manipulatedImage);
      if (!validation.valid) {
        Alert.alert('Image Processing Error', validation.error);
        return;
      }
      
      setEditedImage(manipulatedImage.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to rotate image. Please try again.');
      console.error('Rotate error:', error);
    } finally {
      setIsImageProcessing(false);
    }
  };

  const handleCropImage = async () => {
    if (!editedImage || isImageProcessing) return;
    
    try {
      setIsImageProcessing(true);
      
      // Get image dimensions for cropping
      const imageInfo = await ImageManipulator.manipulateAsync(editedImage, [], {});
      const { width, height } = imageInfo;
      
      if (!width || !height) {
        Alert.alert('Error', 'Unable to get image dimensions. Please try with a different image.');
        return;
      }
      
      // Crop to center with document aspect ratio (4:3)
      const aspectRatio = 4 / 3;
      let cropWidth, cropHeight, x, y;
      
      if (width / height > aspectRatio) {
        // Image is wider, crop width
        cropHeight = height;
        cropWidth = height * aspectRatio;
        x = (width - cropWidth) / 2;
        y = 0;
      } else {
        // Image is taller, crop height
        cropWidth = width;
        cropHeight = width / aspectRatio;
        x = 0;
        y = (height - cropHeight) / 2;
      }
      
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        editedImage,
        [
          {
            crop: {
              originX: x,
              originY: y,
              width: cropWidth,
              height: cropHeight,
            }
          }
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Validate the manipulated image
      const validation = await validateImageFile(manipulatedImage);
      if (!validation.valid) {
        Alert.alert('Image Processing Error', validation.error);
        return;
      }
      
      setEditedImage(manipulatedImage.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image. Please try again.');
      console.error('Crop error:', error);
    } finally {
      setIsImageProcessing(false);
    }
  };

  const handleConfirmImage = async () => {
    if (!editedImage || isLoading || isImageProcessing) return;
    
    try {
      setIsLoading(true);
      
      // Final validation before upload
      const validation = await validateImageFile({ uri: editedImage });
      if (!validation.valid) {
        Alert.alert('Upload Error', validation.error);
        return;
      }
      
      // Create asset-like object for upload
      const asset = {
        uri: editedImage,
        type: 'image/jpeg',
        fileName: `school-id-${Date.now()}.jpg`,
      };
      
      const uploadResult = await uploadSchoolIdWithRetry(asset);
      
      if (uploadResult.success && uploadResult.imageUrl) {
        setSchoolIdImage(uploadResult.imageUrl);
        setShowImageEditor(false);
        // Clean up temporary image
        setEditedImage(null);
        setRotation(0);
        setUploadRetryCount(0);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'School ID uploaded successfully!'
        });
      } else {
        Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Upload confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload with retry logic
  const uploadSchoolIdWithRetry = async (asset: any, maxRetries = 3): Promise<{success: boolean, imageUrl?: string, error?: string}> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setUploadRetryCount(attempt);
        const result = await uploadSchoolId(asset);
        
        if (result.success) {
          return result;
        }
        
        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          return result; // Return final failure result
        }
      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: 'Upload failed after multiple attempts. Please check your connection and try again.'
          };
        }
        
        // Wait before retrying
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: 'Upload failed after multiple attempts.'
    };
  };

  const handleCancelImageEdit = () => {
    // Clean up all image editing state
    setShowImageEditor(false);
    setEditedImage(null);
    setRotation(0);
    setUploadRetryCount(0);
    setIsImageProcessing(false);
  };

  const uploadSchoolId = async (asset: any) => {
    try {
      // Starting image upload process

      // Check if we have a valid URI
      if (!asset.uri) {
        throw new Error('No image URI provided');
      }

      // First test if we can reach the server
      const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/upload-school-id`;
      const healthUrl = `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/health`;
      
      console.log('🏥 Testing server connectivity to:', healthUrl);
      
      try {
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        console.log('🏥 Health check status:', healthResponse.status);
        if (!healthResponse.ok) {
          throw new Error(`Server not reachable: ${healthResponse.status}`);
        }
      } catch (healthError) {
        console.error('❌ Server connectivity test failed:', healthError);
        return { 
          success: false, 
          error: 'Cannot connect to server. Please check that the backend is running and accessible on the network.' 
        };
      }

      console.log('✅ Proceeding with FileSystem upload...');

      // Use FileSystem.uploadAsync which is more reliable for React Native
      
      // For React Native, we need to format the file object correctly
      // Make sure we have the right MIME type
      const mimeType = asset.mimeType || asset.type || 'image/jpeg';
      const fileName = asset.fileName || `school-id-${Date.now()}.jpg`;
      


      console.log('📎 Upload parameters:', {
        url: uploadUrl,
        fileUri: asset.uri,
        fieldName: 'schoolId',
        mimeType: mimeType,
        fileName: fileName,
      });

      const uploadResult = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
        fieldName: 'schoolId',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        parameters: {},
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📊 FileSystem upload result:', uploadResult);
      if (uploadResult.status !== 200) {
        console.error('❌ Upload error response:', uploadResult.body);
        
        // Try to extract meaningful error message
        let errorMessage = `Upload failed with status ${uploadResult.status}`;
        try {
          const errorJson = JSON.parse(uploadResult.body);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // If not JSON, use the raw response
          if (uploadResult.body && uploadResult.body.includes('<html>')) {
            errorMessage = `Server error (${uploadResult.status}). Check backend logs.`;
          } else {
            errorMessage = uploadResult.body || errorMessage;
          }
        }
        
        return { success: false, error: errorMessage };
      }

      console.log('📄 Raw response body:', uploadResult.body);
      
      let result;
      try {
        result = JSON.parse(uploadResult.body);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        return { success: false, error: 'Invalid server response format' };
      }
      
      console.log('✅ Upload successful!', result);
      
      if (!result.imageUrl) {
        return { success: false, error: 'Upload completed but no image URL received' };
      }
      
      return { success: true, imageUrl: result.imageUrl };
    } catch (error) {
      console.error('🚨 Upload error:', error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          return { 
            success: false, 
            error: `Network connection failed. Backend server (192.168.1.100:3000) is not reachable from your device (192.168.1.105). Please check network connectivity.` 
          };
        }
        if (error.message.includes('timeout') || error.message.includes('fetch')) {
          return { 
            success: false, 
            error: 'Upload timeout or connection error. Try a smaller image or check your connection.' 
          };
        }
        return { success: false, error: `Upload error: ${error.message}` };
      }
      
      return { success: false, error: 'Unknown upload error. Please try again.' };
    }
  };

  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!schoolIdImage) {
      Alert.alert('Error', 'Please upload your school ID or report card');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Registering with:', {
        phoneNumber,
        otp,
        name,
        email: email || undefined,
        schoolId: schoolIdImage, // Pass the uploaded image URL as schoolId
      });
      
      await register(phoneNumber, otp, password, name, email || undefined, schoolIdImage);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Registration successful! Welcome to Quizzo!'
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5ede2]" edges={['top']}>
      {/* Image Editor - Native-Style Full Screen */}
      {showImageEditor && (
        <View className="absolute inset-0 bg-black z-50">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Native-style Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={handleCancelImageEdit}
              >
                <Ionicons name="chevron-back" size={28} color="white" />
                <Text className="text-white text-lg ml-1">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`px-6 py-2 rounded-full ${isLoading ? 'bg-gray-600' : 'bg-[#5548E8]'}`}
                onPress={handleConfirmImage}
                disabled={isLoading || isImageProcessing}
              >
                <Text className="text-white font-semibold">
                  {isLoading ? 'Uploading...' : 'Use Photo'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Image Preview - Full Screen with Gestures */}
            <View className="flex-1 justify-center items-center">
              {editedImage && (
                <Image 
                  source={{ uri: editedImage }} 
                  className="w-full h-full"
                  resizeMode="contain"
                />
              )}
              
              {/* Overlay Loading */}
              {isImageProcessing && (
                <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
                  <View className="bg-black bg-opacity-80 rounded-xl px-4 py-3">
                    <Text className="text-white text-sm">Processing...</Text>
                  </View>
                </View>
              )}
            </View>
            
            {/* Bottom Toolbar - Native Style */}
            <View className="pb-8 pt-4">
              {/* Main Actions */}
              <View className="flex-row justify-center items-center gap-12 mb-4">
                <TouchableOpacity
                  className={`w-16 h-16 rounded-full items-center justify-center ${isImageProcessing ? 'bg-gray-600' : 'bg-white bg-opacity-20'}`}
                  onPress={handleCropImage}
                  disabled={isLoading || isImageProcessing}
                >
                  <Ionicons name="crop" size={28} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`w-16 h-16 rounded-full items-center justify-center ${isImageProcessing ? 'bg-gray-600' : 'bg-white bg-opacity-20'}`}
                  onPress={handleRotateImage}
                  disabled={isLoading || isImageProcessing}
                >
                  <Ionicons name="refresh" size={28} color="white" />
                </TouchableOpacity>
              </View>
              
              {/* Action Labels */}
              <View className="flex-row justify-center gap-12">
                <Text className="text-white text-sm opacity-80 w-16 text-center">Crop</Text>
                <Text className="text-white text-sm opacity-80 w-16 text-center">Rotate</Text>
              </View>
              
              {/* Upload Progress */}
              {isLoading && uploadRetryCount > 0 && (
                <View className="mt-4 items-center">
                  <Text className="text-white text-sm opacity-80">
                    {uploadRetryCount > 1 ? `Uploading... (Attempt ${uploadRetryCount})` : 'Uploading...'}
                  </Text>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      )}
      
      <ScrollView className="flex-grow pb-5" showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity 
          className="ml-5 mt-2.5 w-10 h-10 bg-white rounded-full items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
        </TouchableOpacity>

        {/* Header */}
        <View className="px-7 pt-7 pb-12">
          <Text className="text-3xl font-bold text-gray-900 leading-9">
            {step === 'phone' && 'Enter Your Phone\nNumber'}
            {step === 'otp' && 'Verify Your\nPhone Number'}
            {step === 'details' && 'Hello! Register To Get\nStarted'}
            {step === 'upload' && 'Upload School ID\nor Report Card'}
          </Text>
        </View>

        {/* Form */}
        <View className="px-7 pb-10">
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <>
              {/* Phone Number Input with Country Code */}
              <View className="relative mb-4">
                <View className="flex-row">
                  {/* Country Code Picker */}
                  <TouchableOpacity 
                    className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-l-lg px-3 py-4 flex-row items-center"
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                  >
                    <Text className="text-base text-gray-900 mr-1">
                      {countryCodes.find(c => c.code === countryCode)?.flag || '🌍'}
                    </Text>
                    <Text className="text-base text-gray-900 mr-1">{countryCode}</Text>
                    <Ionicons name="chevron-down" size={16} color="#8391A1" />
                  </TouchableOpacity>
                  
                  {/* Phone Number Input */}
                  <TextInput
                    className="bg-[#F7F8F9] border border-[#E8ECF4] border-l-0 rounded-r-lg px-4 py-4 text-base text-gray-900 flex-1"
                    placeholder="Phone Number"
                    placeholderTextColor="#8391A1"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
                
                {/* Country Code Dropdown */}
                {showCountryPicker && (
                  <View className="absolute top-16 left-0 right-0 bg-white border border-[#E8ECF4] rounded-lg shadow-lg z-10 max-h-48">
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {countryCodes.map((country) => (
                        <TouchableOpacity
                          key={country.code}
                          className="flex-row items-center px-4 py-3 border-b border-gray-100"
                          onPress={() => {
                            setCountryCode(country.code);
                            setShowCountryPicker(false);
                          }}
                        >
                          <Text className="text-xl mr-3">{country.flag}</Text>
                          <Text className="text-gray-900 font-medium mr-2">{country.code}</Text>
                          <Text className="text-gray-600 flex-1">{country.country}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              <TouchableOpacity
                className={`bg-[#5548E8] rounded-lg py-4 items-center mb-9 ${isLoading ? 'opacity-60' : ''}`}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                <Text className="text-white text-base font-semibold">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <View className="relative mb-4">
                <TextInput
                  className="bg-[#F7F7F7] border border-[#E8E8E8] rounded-lg px-4 py-4 text-base text-gray-900"
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#8B8B8B"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                className="bg-[#5548E8] rounded-lg py-4 items-center mb-9"
                onPress={handleVerifyAndNext}
              >
                <Text className="text-white text-base font-semibold">
                  Verify & Continue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep('phone')}
                className="items-center mb-4"
              >
                <Text className="text-[#35C2C1] text-sm font-medium">← Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 3: Personal Details */}
          {step === 'details' && (
            <>
              <View className="relative mb-4">
                <TextInput
                  className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-4 py-4 text-base text-gray-900"
                  placeholder="Full Name"
                  placeholderTextColor="#8391A1"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View className="relative mb-4">
                <TextInput
                  className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-4 py-4 text-base text-gray-900"
                  placeholder="Email (Optional)"
                  placeholderTextColor="#8391A1"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                className={`rounded-lg py-4 items-center mb-9 ${!name.trim() ? 'bg-gray-300' : 'bg-[#5548E8]'}`}
                onPress={handleNext}
                disabled={!name.trim()}
              >
                <Text className="text-white text-base font-semibold">
                  Next
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep('otp')}
                className="items-center mb-4"
              >
                <Text className="text-[#35C2C1] text-sm font-medium">← Back</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 4: School ID Upload */}
          {step === 'upload' && (
            <>
              {/* Upload Section */}
              <View className="mb-6">
                {!schoolIdImage ? (
                  /* Upload Area - No Image - Compact Design */
                  <View className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg p-4">
                    <View className="items-center mb-4">
                      <View className="w-12 h-12 bg-[#5548E8] rounded-full items-center justify-center mb-3">
                        <Ionicons name="document-attach" size={20} color="white" />
                      </View>
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        Upload School ID or Report Card
                      </Text>
                      <Text className="text-sm text-[#8391A1] text-center">
                        Choose your preferred method
                      </Text>
                    </View>
                    
                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        className="flex-1 bg-white border border-[#E8ECF4] rounded-lg py-3 px-4 flex-row items-center justify-center"
                        onPress={handleCameraPick}
                        disabled={isLoading}
                      >
                        <Ionicons name="camera" size={18} color="#5548E8" />
                        <Text className="text-[#5548E8] font-medium ml-2 text-sm">Camera</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className="flex-1 bg-white border border-[#E8ECF4] rounded-lg py-3 px-4 flex-row items-center justify-center"
                        onPress={handleGalleryPick}
                        disabled={isLoading}
                      >
                        <Ionicons name="images" size={18} color="#5548E8" />
                        <Text className="text-[#5548E8] font-medium ml-2 text-sm">Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* Upload Area - With Image */
                  <View className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg p-4">
                    <View className="items-center mb-4">
                      <View className="relative">
                        <Image 
                          source={{ uri: schoolIdImage }} 
                          className="w-40 h-28 rounded-lg"
                          resizeMode="cover"
                        />
                        <View className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      </View>
                    </View>
                    
                    <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                        <Text className="text-green-700 font-medium ml-2 text-sm">
                          School ID uploaded successfully
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        className="flex-1 bg-white border border-[#E8ECF4] rounded-lg py-2 px-3 flex-row items-center justify-center"
                        onPress={handleCameraPick}
                        disabled={isLoading}
                      >
                        <Ionicons name="camera" size={16} color="#5548E8" />
                        <Text className="text-[#5548E8] font-medium ml-1 text-sm">Camera</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className="flex-1 bg-white border border-[#E8ECF4] rounded-lg py-2 px-3 flex-row items-center justify-center"
                        onPress={handleGalleryPick}
                        disabled={isLoading}
                      >
                        <Ionicons name="images" size={16} color="#5548E8" />
                        <Text className="text-[#5548E8] font-medium ml-1 text-sm">Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              <View className="relative mb-4">
                <TextInput
                  className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-4 py-4 text-base text-gray-900 pr-16"
                  placeholder="Enter your password"
                  placeholderTextColor="#8391A1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#8391A1" 
                  />
                </TouchableOpacity>
              </View>

              <View className="relative mb-4">
                <TextInput
                  className="bg-[#F7F8F9] border border-[#E8ECF4] rounded-lg px-4 py-4 text-base text-gray-900 pr-16"
                  placeholder="Confirm Password"
                  placeholderTextColor="#8391A1"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#A8A8A8" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={`rounded-lg py-4 items-center mb-9 ${isLoading ? 'bg-gray-300' : 'bg-[#4d61de]'}`}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text className="text-white text-base font-semibold">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setStep('details')}
                className="items-center mb-4"
              >
                <Text className="text-[#35C2C1] text-sm font-medium">← Back</Text>
              </TouchableOpacity>
            </>
          )}

        {/* Social Login */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-[#E8E8E8]" />
          <Text className="mx-4 text-[#8B8B8B] text-sm">Or Register with</Text>
          <View className="flex-1 h-px bg-[#E8E8E8]" />
        </View>

        <View className="flex-row justify-center gap-6 mb-8">
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full shadow-sm border border-[#E8E8E8] items-center justify-center">
            <FontAwesome name="facebook-f" size={20} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 bg-white rounded-full shadow-sm border border-[#E8E8E8] items-center justify-center">
            <AntDesign name="google" size={20} color="#DB4437" />
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-[#8B8B8B] text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-[#35C2C1] text-sm font-medium">Login Now</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

