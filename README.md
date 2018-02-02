Example run using three tabs:

Tab 1: node server.js 3000
Tab 2: node server.js 3001 3001
Tab 3: node server.js 3002 3000 

NOTE: there's a bug when you kill a process in one or more of the tabs where the port entry is still being displayed in the other tabs although it doesn't update. The correct behavior is for the port entry to not show up in the results after the respective port is stopped.