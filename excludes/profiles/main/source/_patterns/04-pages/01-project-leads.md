---
content_key: main_content
---
# For Project Leads

What even is Fepper? The name is a portmanteau of "Front End Prototyper". You 
can build websites without needing to install or configure a backend database. 
You do not need to know or learn a difficult frontend JavaScript framework. So 
if you need to prototype a website, you can do so rapidly. If you will 
eventually need more complexity or difficulty, you can incorporate those things 
later.

Using this demo site as an example, you can see from the top menu, that the 
parts of this site are categorized from small to large in nesting "patterns", 
e.g. Elements, Compounds, etc. The patterns need to be written in a superset of 
HTML called Feplet, which in turn is a superset of Mustache. The only difference 
between Feplet and HTML is the tags which enable templating.

The styles for the patterns are located in the `source/_styles` directory on 
the file system. The demo site uses Stylus to preprocess CSS. This allows Fepper 
to categorize styles in a directory structure resembling the patterns in 
`source/_patterns`.

Fepper also gives Editors the ability to edit Markdown files directly in the UI. 
Click the eyeball icon on the right side of the top menu. Then click "CODE". By 
default, the Code Viewer shows the Feplet pane. You can view the Feplet code of 
the pattern, and even navigate through the linked tags. Click on the "Markdown" 
tab and if the pattern has an associated `.md` file, its Markdown will be 
displayed. It can be edited by clicking the "Edit" button. If the project was 
set up with Git, the Editor can pull commits from remote and push commits from 
local.

The Code Viewer also gives JavaScript Developers the ability to inspect state. 
If application state is managed through Requerio, upon opening the Requerio pane 
of the Code Viewer, Developers can hover over the state tree and highlight the 
corresponding element. The state tree will display changes to state in real 
time. This demo site also gives examples of server-side Node.js testing, which 
are state-driven.

If after prototyping, you reach a point of completion and don't need further 
complexity, you can output a fully operational website by running `fp static` 
on the command line. The static site will be built out to the `public/static` 
directory.
