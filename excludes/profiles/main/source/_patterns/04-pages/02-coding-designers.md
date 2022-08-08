---
content_key: main_content
---
# For Coding Designers

Those skilled with HTML and CSS, and with an eye for design, can be delegated 
to work on patterns, without having to edit the same file as others assigned 
different tasks.

The "patterns" are located in the `source/_patterns` directory on the file 
system. The patterns need to be written in a superset of HTML called Feplet, 
which in turn is a superset of Mustache. The only difference between Feplet and 
HTML is the tags which enable templating.

The styles for the patterns are located in the `source/_styles` directory on the 
file system. The demo site uses Stylus to preprocess CSS. This allows Fepper to 
categorize styles in a directory structure resembling the patterns in 
`source/_patterns`. If you prefer a CSS pre/postprocessor other than Stylus, you 
are free to replace it. However, it is recommended to keep the nested directory 
structure resembling that of `source/_patterns`. You may also use plain CSS 
without additional processing.

Here's a hint to help style patterns: Fepper uses LiveReload to pick up changes 
to patterns or styles on the file system and automatically reload them in the 
Browser. However, if you use your browser's Developer Tools to inspect an 
element or its styles, the UI will generally reload the data in the Developer 
Tools any time there is a change, making you lose your place, and forcing you to 
re-inspect. Instead, click the eyeball icon, then click "OPEN IN NEW TAB". The 
pattern will load in a new tab without the UI. It will still LiveReload changes, 
but this will not cause you to lose your place in the Developer Tools.
