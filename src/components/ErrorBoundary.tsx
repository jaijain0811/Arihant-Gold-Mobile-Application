import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Oops! Something went wrong.</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Please tap below to reload the application.
            </Text>
            {this.state.error?.message ? (
              <Text style={styles.errorDetails} numberOfLines={3}>
                {this.state.error.message}
              </Text>
            ) : null}
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0907',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#181410',
    borderColor: 'rgba(212,175,55,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B0A290',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorDetails: {
    color: '#EF4444',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#0b0907',
    fontSize: 14,
    fontWeight: '800',
  },
});
