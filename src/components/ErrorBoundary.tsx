import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import * as Sentry from '@sentry/react-native';
import { Colors } from '../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      // Error is captured by Sentry via the reportError service
    }
    Sentry.captureException(error, { extra: { errorInfo } });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.surface,
            padding: 32,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: Colors.errorContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={28} color={Colors.error} strokeWidth={1.5} />
          </View>
          <Text
            style={{
              fontFamily: 'Manrope_600SemiBold',
              fontSize: 20,
              color: Colors.onSurface,
              textAlign: 'center',
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: Colors.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            An unexpected error occurred. Please try again.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: Colors.primaryFixed,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 9999,
              marginTop: 8,
            }}
          >
            <RefreshCw size={16} color={Colors.primary} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: Colors.primary,
              }}
            >
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
