Output demo.gif

Require nightly

Set Shell "bash"
Set FontFamily "MonoLisa Nerd Font"
Set FontSize 14
Set Width 960
Set Height 540
Set Theme "Catppuccin Mocha"
Set WindowBar Colorful
Set Padding 20
Set TypingSpeed 50ms
Set CursorBlink false

# Show help
Sleep 300ms
Type "nightly --help"
Sleep 500ms
Enter
Sleep 4s

# Clear and show trending repos
Ctrl+L
Sleep 300ms
Type "nightly --limit 3 20260205"
Sleep 500ms
Enter
Wait+Screen /CHANGELOG NIGHTLY/
Sleep 4s
