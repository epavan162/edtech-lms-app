import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { Colors } from '../src/theme';
import { Button } from '../src/components/ui/Button';

// Inline HTML template styled with Stitch design tokens
function getCourseHtml(title?: string, description?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title || 'Course Content'} | The Atelier</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --primary: #3730A3;
      --primary-container: #4F4BBC;
      --on-primary: #FFFFFF;
      --surface: #F7F9FB;
      --surface-container-lowest: #FFFFFF;
      --on-surface: #191C1E;
      --on-surface-variant: #454652;
      --primary-fixed: #E2DFFF;
      --secondary-container: #D0E1FB;
      --on-secondary-container: #54647A;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--surface);
      color: var(--on-surface);
      padding: 24px;
      line-height: 1.6;
    }
    h1, h2, h3 { font-family: 'Manrope', sans-serif; color: var(--on-surface); }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
    h2 { font-size: 1.25rem; font-weight: 600; margin-top: 32px; margin-bottom: 12px; }
    p { font-size: 0.875rem; color: var(--on-surface-variant); margin-bottom: 16px; }
    .hero {
      background: linear-gradient(135deg, var(--primary), var(--primary-container));
      border-radius: 24px; padding: 32px 24px; margin-bottom: 32px; color: var(--on-primary);
    }
    .hero h1 { color: var(--on-primary); }
    .hero p { color: rgba(255,255,255,0.85); }
    .chip {
      display: inline-flex; align-items: center; background: var(--secondary-container);
      color: var(--on-secondary-container); padding: 4px 12px; border-radius: 999px;
      font-size: 0.75rem; font-weight: 600; margin-right: 8px; margin-bottom: 8px;
    }
    .module {
      background: var(--surface-container-lowest); border-radius: 16px;
      padding: 20px; margin-bottom: 16px;
    }
    .module-title { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.9375rem; margin-bottom: 4px; }
    .module-meta { font-size: 0.75rem; color: var(--on-surface-variant); }
    .progress-bar { width: 100%; height: 4px; background: #F2F4F6; border-radius: 2px; margin-top: 12px; overflow: hidden; }
    .progress-bar .fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-container)); border-radius: 2px; }
    .callout { background: var(--primary-fixed); border-radius: 16px; padding: 20px; margin: 24px 0; }
    .callout p { color: var(--primary); margin-bottom: 0; }
    ul { list-style: none; padding: 0; }
    ul li { position: relative; padding-left: 20px; margin-bottom: 12px; font-size: 0.875rem; color: var(--on-surface-variant); }
    ul li::before { content: '✓'; position: absolute; left: 0; color: var(--primary); font-weight: 600; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${title || 'Course Content'}</h1>
    <p>${description || 'Explore the curated learning modules designed to elevate your expertise.'}</p>
  </div>
  <div>
    <span class="chip">📹 Video Lessons</span>
    <span class="chip">📄 Resources</span>
    <span class="chip">🏆 Certificate</span>
  </div>
  <h2>Curriculum</h2>
  <div class="module"><div class="module-title">Module 1: Foundations</div><div class="module-meta">Introduction to core concepts • 12:45</div><div class="progress-bar"><div class="fill" style="width:100%"></div></div></div>
  <div class="module"><div class="module-title">Module 2: Advanced Techniques</div><div class="module-meta">Deep-dive into methodology • 45:20</div><div class="progress-bar"><div class="fill" style="width:60%"></div></div></div>
  <div class="module"><div class="module-title">Module 3: Practical Application</div><div class="module-meta">Real-world case studies • 32:15</div><div class="progress-bar"><div class="fill" style="width:0%"></div></div></div>
  <div class="module"><div class="module-title">Module 4: Mastery & Review</div><div class="module-meta">Final project and assessment • 28:00</div><div class="progress-bar"><div class="fill" style="width:0%"></div></div></div>
  <div class="callout"><p><strong>💡 Curator's Tip:</strong> Complete modules in order for the best learning experience.</p></div>
  <h2>What You'll Learn</h2>
  <ul>
    <li>Understand core principles and best practices</li>
    <li>Master advanced techniques used by industry leaders</li>
    <li>Apply knowledge to real-world scenarios</li>
    <li>Build a portfolio-ready capstone project</li>
  </ul>
  <script>
    window.addEventListener('message', function(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'COURSE_DATA') {
          document.querySelector('h1').textContent = data.title || 'Course Content';
        }
      } catch (e) {}
    });
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'WEBVIEW_LOADED' }));
    }
  </script>
</body>
</html>`;
}

export default function WebViewScreen() {
  const { title, description } = useLocalSearchParams<{
    title?: string;
    description?: string;
  }>();
  const router = useRouter();
  const [error, setError] = useState(false);

  // On web, we render the HTML inline via iframe / dangerouslySetInnerHTML
  // On native, we use react-native-webview
  const isWeb = Platform.OS === 'web';
  const htmlContent = getCourseHtml(title, description);

  if (isWeb) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
            backgroundColor: Colors.surfaceContainerLowest,
            shadowColor: Colors.onSurface,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Colors.surfaceContainerHigh,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color={Colors.onSurface} strokeWidth={1.5} />
          </Pressable>
          <Text
            style={{
              flex: 1,
              fontFamily: 'Inter_500Medium',
              fontSize: 16,
              color: Colors.onSurface,
            }}
            numberOfLines={1}
          >
            {title || 'Course Content'}
          </Text>
        </View>

        {/* Web: Use iframe */}
        <View style={{ flex: 1 }}>
          <iframe
            srcDoc={htmlContent}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            } as any}
            title="Course Content"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Native: Use WebView
  const WebView = require('react-native-webview').WebView;
  const webViewRef = useRef<any>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          backgroundColor: Colors.surfaceContainerLowest,
          shadowColor: Colors.onSurface,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.surfaceContainerHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} color={Colors.onSurface} strokeWidth={1.5} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            color: Colors.onSurface,
          }}
          numberOfLines={1}
        >
          {title || 'Course Content'}
        </Text>
      </View>

      {error ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
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
            Content Unavailable
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 14,
              color: Colors.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            We couldn't load the course content. Please check your connection and try again.
          </Text>
          <Button
            title="Retry"
            onPress={() => {
              setError(false);
              webViewRef.current?.reload();
            }}
            variant="secondary"
            icon={<RefreshCw size={16} color={Colors.onSurface} strokeWidth={1.5} />}
          />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          onError={() => setError(true)}
          onHttpError={() => setError(true)}
          onMessage={(event: any) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'WEBVIEW_LOADED') {
                // WebView content loaded
              }
            } catch {}
          }}
          style={{ flex: 1, backgroundColor: Colors.surface }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          // Pass course info via custom headers (assignment requirement)
          injectedJavaScript={`
            window.COURSE_TITLE = "${(title || '').replace(/"/g, '\\"')}";
            window.COURSE_DESCRIPTION = "${(description || '').replace(/"/g, '\\"')}";
            true;
          `}
        />
      )}
    </SafeAreaView>
  );
}
