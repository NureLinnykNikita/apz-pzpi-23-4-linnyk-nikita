import 'package:dio/dio.dart';

class AppException implements Exception {
  final String message;
  final int? statusCode;

  const AppException(this.message, {this.statusCode});

  factory AppException.fromDio(DioException e) {
    final data = e.response?.data;
    String msg = 'Something went wrong';

    if (data is Map && data['message'] != null) {
      msg = data['message'].toString();
    } else if (data is String && data.isNotEmpty) {
      msg = data;
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      msg = 'Connection timed out';
    } else if (e.type == DioExceptionType.connectionError) {
      msg = 'No internet connection';
    }

    return AppException(msg, statusCode: e.response?.statusCode);
  }

  @override
  String toString() => message;
}
