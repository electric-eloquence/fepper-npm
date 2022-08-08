---
content_key: main_content
---
# Client-side Actions 

Open `source/_scripts/src/requerio-app.cjs` in a text editor or IDE. The first 
declaration defines the `$organisms` object which will be submitted to the 
`Requerio` constructor. `$` is jQuery. That and Redux were written to the 
`window` object when those packages were initialized earlier in the page-load. 
After Requerio gets initialized, two event listeners get created. The event 
listener we're concerned with is the one added to the 
`#sidebar-toggle-for-small-vp` organism.

To see it in action, shrink the UI viewport enough such that the sidebar 
disappears and a toggle button appears in the upper-right of this pattern. (The 
SM size will do.) Clicking `#sidebar-toggle-for-small-vp` dispatches a 
`toggleClass` action on itself. This means that the `active` CSS class gets 
toggled on or off the `#sidebar-toggle-for-small-vp` organism. Similarly, the 
`#nav` organism gets the `active` class added or removed based on whether it was 
added or removed from `#sidebar-toggle-for-small-vp`.

In order to determine whether `active` was added or removed from 
`#sidebar-toggle-for-small-vp`, the `.getState()` method is invoked on the 
`#nav` organism. This returns an object representing the state of the organism. 
We check the `classArray` property of this object to see whether it includes 
the `active` class. If it's included, we add it to the `#nav` organism. If not, 
we remove it.

When the `active` class is added, the sidebar appears. When it is removed, the sidebar 
disappears. These changes will show up in real-time in the Requerio Inspector. Just 
expand the state tree for `#nav` and its `classArray`.
