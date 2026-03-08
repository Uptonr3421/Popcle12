import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.header}>Oops!</Text>
          <Text style={styles.message}>Something went wrong</Text>
          <Text style={styles.sub}>
            The app ran into an unexpected error. Tap below to try again.
          </Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff9f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ff3b8d',
    marginBottom: 12,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1715',
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: 'rgba(31,23,21,0.5)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#ff3b8d',
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 16,
    shadowColor: '#ff3b8d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
