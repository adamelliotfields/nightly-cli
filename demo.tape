Output demo.gif

Require nightly

Set Shell "bash"
Set FontFamily "MonoLisa Nerd Font"
Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"
Set WindowBar Colorful
Set Padding 20
Set TypingSpeed 50ms
Set CursorBlink false

# Show help
Type "nightly --help"
Sleep 500ms
Enter
Sleep 1s
Sleep 3s

# Clear and show trending repos
Ctrl+L
Sleep 300ms
Type "nightly -l 3"
Sleep 500ms
Enter
Wait+Screen /★/
Sleep 4s
