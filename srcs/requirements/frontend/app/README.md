**TODO:**
Use Postman to get Data from Backend for:
	- All Channels   
	- All DMs









!!!!!!!! Need to Ask Guiluame where is the eval going to take place? On what Machine? And then test it out on that machine and prep it for that machine



For Linux:

1. setup.sh
2. make fore
-. try localhost in browser

3. docker exec -it frontend bash
4. npm run dev
-. try localhost in browser


**From BackEnd:**
- Need an AllChats HTTP Req to be displayed
allChannels array 
allUserChats array
OR
Both Requests rolled up into One
allChats



***Features:***
1. Channels types:
Public -- User can search and Channels, must have an identifier

Private -
Protected -Pass

2. Commands for Chat that Need Buttons or Right Click:
- Ban
- Kick

The User can change the Type of Channel(Private Protected, Public)

3. Details:
- Owner
- Admin
- All Users in Chat
Bonus - Buttons for Kickc Ban Etc

Somewhere Search for Users in order to Add them to a Channel

One button for Search

One for Create
- Name Unique
- Type
- If Protected PAssword




TO DO - CHAT
--------------------------------------------------
*EVAL SHEET*
- Leave Channel Button
- Ban Button  -- With Field
- Kick Button  -- With Field
- Mute Users Button -- With Field
- Add Password to Protect Channel Button -- With Field
- Invite to play Pong Button -- With Field
- Go to other users Profile Page Button -- With Field



- IF other users names are right clicked then User:
	-redirected to their profile page
	OR
	- Invite to play Pong



*User/Avatar/Status*
- Dinamically get the Username, Avatar and Status
- from the start
Avatar - Done
Username - Not Yet need to figure a way to get it from the back-end and make the API Req Dynamic
Status - Not Now, Bonus, only if needed


*Search Bar*
- Find and Display either Name of Channels or Name of Users with which we have an existing conversation


*Join Button*
- Create a Search bar that extends from the Plus Button
-------------------------------------
| + |   | Create or Join Channel |
-------------------------------------
- Add HTTP Req for 

*Chat List*
- Dynamically Get List of Existing Joined Channels and Users


*Chat Room*
- Dynamically get the name of the Channel or User Chat
- previous messages
- List of Users in the Channel


*List of Users*
- Create the Container
- Get Users list depennding on the channel


*Terminal*
- Create a container that will take the input from the user and Send it to the Backend







How do I fix react-scripts not found?
Run the npm install react-scripts command to solve the "react-scripts: command not found" error. If necessary delete your node_modules directory and your package-lock. json file, reinstall your dependencies and restart your development server.


Tutorials:

Google Login
https://blog.logrocket.com/guide-adding-google-login-react-app/


React Router
https://stackoverflow.com/questions/58875910/how-to-render-multiple-components-same-route-path-with-react-router

https://stackoverflow.com/questions/72658535/usenavigate-hook-with-multiple-choices

https://stackoverflow.com/questions/58875910/how-to-render-multiple-components-same-route-path-with-react-router

https://stackoverflow.com/questions/32577886/is-there-a-way-to-render-multiple-react-components-in-the-react-render-functio


https://www.youtube.com/watch?v=Ul3y1LXxzdU&ab_channel=WebDevSimplified










This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
