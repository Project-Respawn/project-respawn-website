Project Respawn Investor Data Room — Frontend Demo

Suggested route: /investors/data-room

Files:
- InvestorDataRoom.vue
- InvestorDataRoom.css
- investorDataRoom.js

Behaviour:
- currentAccessLevel defaults to PRE_NDA for frontend demo.
- Documents above the user's access level are fully hidden, including their titles.
- The investor only sees a count of protected documents and an unlock icon.
- Request unlock opens a pre-filled email asking for the Project Respawn account email.
- Open-document actions are placeholders until secure private-storage access is wired in.

Production security must be server-side:
Cognito authentication -> InvestorAccess record -> private storage -> permission check -> short-lived signed URL.

Never treat currentAccessLevel in this Vue page as a security boundary.
