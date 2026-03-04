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
Sleep 3s

# Clear and show trending repos
Ctrl+L
Sleep 300ms
Type "nightly --limit 3 20260303"
Sleep 500ms
Enter
Wait+Screen /CHANGELOG NIGHTLY/
Sleep 3s

# Clear and show JSON
Ctrl+L
Sleep 300ms
Type "nightly --limit 2 20260303 --json"
Sleep 500ms
Enter
Wait+Screen /created_at/
Sleep 3s
