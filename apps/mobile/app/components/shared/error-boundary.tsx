import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary to catch unhandled JS exceptions
 * Displays a red screen with the error details instead of crashing the app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRestart = () => {
    // Clear the error state to allow re-rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.subtitle}>
                The application encountered an unexpected error.
              </Text>
            </View>

            <View style={styles.errorContainer}>
              <Text style={styles.errorLabel}>Error:</Text>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
              
              {this.state.errorInfo && (
                <>
                  <Text style={styles.errorLabel}>Component Stack:</Text>
                  <Text style={styles.stackText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleRestart}
            >
              <Text style={styles.buttonText}>Restart Application</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5', // Light red background
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEB2B2',
    marginBottom: 20,
  },
  errorLabel: {
    fontWeight: 'bold',
    color: '#742A2A',
    marginBottom: 4,
    marginTop: 10,
  },
  errorText: {
    color: '#C53030',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  stackText: {
    color: '#742A2A',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
