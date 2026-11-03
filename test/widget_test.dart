import 'package:flutter_test/flutter_test.dart';
import 'package:yivu/main.dart';

void main() {
  testWidgets('YivuApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const YivuApp());
    expect(find.byType(YivuApp), findsOneWidget);
  });
}
