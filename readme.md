# CRYPTOLINK

This is a proof of concept fullstack implementation of a blockchain environment.

## Why?

I was interested in blockchain technology and wanted to actually explore how it functioned on the lowest level and how its components worked with each other.

Finally got a reason to learn and implement the below technologies. Also wanted to try-out [TDD](#development-method). 

## TechStack
><br>

> - Server-side Scripting => **Node.js@11.0.0**
>
> - API => **Express.js@4.16.3**
> 
> - Database =>**Redis@5.0.7**
>
> - Testing => **Jest@6.4.1**
>
> - FrontEnd => **React.js@16.6.0**
> <br>
<br>

## Development Method

>TDD (Test Driven Development)
>
> With the help of __Jest__, I managed to create tests based on required functionality for a particular function / class / module.
>
> Thus now I only needed to focus on turning those test cases from <span style="color:red">Red</span> to <span style="color:lightGreen">Green</span>.
>
>Writing the test cases consume quite a bit of time and effort but saved me even more time and stress in the long run as it was easy to check if my current changes are affecting the functionality of previous modules.
>
>Also being specific in describing the testcases helps in pinpointing the problematic scenarios.

## To run locally
1. install ```npm``` and ```nodejs```
2. clone this repo
3. > ```npm install``` 
4. > ```npm run dev ```
5. Open http://localhost:3000/ on your browser

## Future Scope
1. Fix the terrible __UI__ to something more elegant.
2. Add functionality to use __filesystem__ inorder to save the blockchain offline.
3. Use socket.io instead of __interval__ for ```transaction Pool```.
4. Add user __authentication__. 





