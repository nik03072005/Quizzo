import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error, resetError: () => void}>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to crash analytics service in production
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <View className="flex-1 justify-center items-center p-5 bg-gray-100">
          <Text className="text-xl font-bold mb-2.5 text-gray-800">Oops! Something went wrong</Text>
          <Text className="text-base text-center mb-5 text-gray-600">
            We encountered an unexpected error. Please try again.
          </Text>
          <TouchableOpacity className="bg-[#007AFF] px-5 py-2.5 rounded-lg" onPress={this.resetError}>
            <Text className="text-white text-base font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}



export default ErrorBoundary;