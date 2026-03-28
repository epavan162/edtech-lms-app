import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Colors } from '../../theme';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => onDone());
  }, [opacity, translateY, onDone]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      dismiss();
    }, 2500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [opacity, translateY, dismiss]);

  const bgColor =
    toast.type === 'success'
      ? Colors.primaryFixed
      : toast.type === 'error'
      ? Colors.errorContainer
      : Colors.secondaryContainer;

  const textColor =
    toast.type === 'success'
      ? Colors.primary
      : toast.type === 'error'
      ? Colors.error
      : Colors.onSecondaryContainer;

  const icon =
    toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: textColor + '20' }]}>
        <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
      </View>
      <Text style={[styles.message, { color: textColor }]} numberOfLines={2}>
        {toast.message}
      </Text>
      <Pressable
        onPress={dismiss}
        hitSlop={8}
        style={[styles.closeBtn, { backgroundColor: textColor + '15' }]}
      >
        <Text style={[styles.closeIcon, { color: textColor }]}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDone={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 60,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: 400,
    width: '100%',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 10,
    fontWeight: '700',
  },
});
