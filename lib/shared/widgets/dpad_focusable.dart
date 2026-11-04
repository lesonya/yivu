import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Reusable D-Pad & Touch focusable card designed for Android TV (10-foot UI)
/// and Android Tablets.
/// Implements high-contrast focus states with brand tokens (#14B8A6 Teal / #2563EB Cobalt).
class DPadFocusableCard extends StatefulWidget {
  final Widget child;
  final VoidCallback onSelect;
  final bool autofocus;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final Color? backgroundColor;
  final Gradient? gradient;

  const DPadFocusableCard({
    super.key,
    required this.child,
    required this.onSelect,
    this.autofocus = false,
    this.borderRadius = 24.0,
    this.padding = const EdgeInsets.all(16.0),
    this.backgroundColor,
    this.gradient,
  });

  @override
  State<DPadFocusableCard> createState() => _DPadFocusableCardState();
}

class _DPadFocusableCardState extends State<DPadFocusableCard> {
  bool _isFocused = false;
  bool _isHovered = false;

  bool get _isActive => _isFocused || _isHovered;

  @override
  Widget build(BuildContext context) {
    const focusGlowColor = Color(0xFF14B8A6); // Brand Teal
    const defaultBorder = Colors.white12;

    return Focus(
      autofocus: widget.autofocus,
      onFocusChange: (focused) => setState(() => _isFocused = focused),
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.select ||
              event.logicalKey == LogicalKeyboardKey.enter ||
              event.logicalKey == LogicalKeyboardKey.gameButtonA) {
            widget.onSelect();
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      },
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: GestureDetector(
          onTap: widget.onSelect,
          child: AnimatedScale(
            scale: _isActive ? 1.06 : 1.0,
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOutCubic,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOutCubic,
              padding: widget.padding,
              decoration: BoxDecoration(
                color: widget.gradient != null ? null : (widget.backgroundColor ?? const Color(0xFF1E293B)), // Navy Surface
                gradient: widget.gradient,
                borderRadius: BorderRadius.circular(widget.borderRadius),
                border: Border.all(
                  color: _isActive ? focusGlowColor : defaultBorder,
                  width: _isActive ? 3.5 : 1.0,
                ),
                boxShadow: _isActive
                    ? [
                        BoxShadow(
                          color: focusGlowColor.withOpacity(0.50),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ]
                    : [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
              ),
              child: widget.child,
            ),
          ),
        ),
      ),
    );
  }
}

