import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthController {
  final String _baseUrl = 'https://vaccibite-server.onrender.com'; // Your backend URL

  Future<Map<String, dynamic>> login({
    required String barangay,
    required String email,
    required String password,
  }) async {
    try {
      final url = Uri.parse('$_baseUrl/auth/login');

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'barangay': barangay,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'message': data['message'],
          'user': data['user'],
          'token': data['token'], // if using JWT
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
