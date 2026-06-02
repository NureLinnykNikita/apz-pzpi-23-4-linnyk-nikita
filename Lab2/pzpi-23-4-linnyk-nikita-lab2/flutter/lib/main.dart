import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/network/dio_client.dart';
import 'core/router/app_router.dart';
import 'core/storage/secure_storage.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/domain/auth_notifier.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ProviderScope(
      overrides: [
        // Wire dioProvider to a DioClient that reads auth state
        // We use an override so the DioClient gets a Ref at creation time.
        dioProvider.overrideWith((ref) {
          final client = DioClient(
            storage: ref.read(secureStorageProvider),
            getAccessToken: () =>
                ref.read(authNotifierProvider).valueOrNull?.accessToken,
            onTokenRefreshed: (token) => ref
                .read(authNotifierProvider.notifier)
                .setAccessToken(token),
            onLogout: () =>
                ref.read(authNotifierProvider.notifier).logout(),
          );
          return client.dio;
        }),
      ],
      child: const LangBangApp(),
    ),
  );
}

class LangBangApp extends ConsumerWidget {
  const LangBangApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'LangBang',
      theme: buildAppTheme(),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
