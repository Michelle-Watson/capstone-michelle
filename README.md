# Project Title

GameDeal Finder
NOTES FROM LECTURE: DONT have login page, dont think about it from now

## Overview

##### What is your app? Give a brief description in a couple of sentences.

GameDeal Finder is an application that helps users find the best deals on video games across multiple platforms. Users can search for a specific video game title, view its price on supported platforms, and be directed to the store page to make a purchase. Initially, the app will focus on Steam, with the potential to add other gaming platforms in the future.

### Problem Space

##### Why is your app needed? Give any background information around any pain points or other reasons.

Video game prices can vary significantly between different digital storefronts, and it can be time-consuming for users to check multiple sites to find the best deal. Many gamers end up missing out on sales or discounts because they don't have an easy way to compare prices across platforms. GameDeal Finder solves this problem by providing a simple, user-friendly interface that aggregates video game prices from different platforms, helping users make informed purchasing decisions and saving them money.

### User Profile

##### Who will use your app? How will they use it? Add any special considerations that your app must take into account.

Gamers:

- Looking for the best prices for video games before purchasing.
- Interested in sales, discounts, or price drops for their favorite titles
- Want a simple, fast way to compare prices without visiting multiple sites.

### Features

##### List the functionality that your app will include. These can be written as user stories or descriptions with related details. Do not describe _how_ these features are implemented, only _what_ needs to be implemented.

- As a user, I want to search for a video game by title and see prices across different platforms.
- As a user, I want to click on a link that takes me directly to the store page where I can purchase the game.
- As a user, I want to see a list of platforms and their current price for a specific game.
- As a user, I want to see the game’s current price, regular price, and any discounts applied (if available).
- As a user, I want the app to display the platform’s logo (e.g., Steam, GOG) alongside the price for easy identification.
- As a user, I want to be able to filter results by platform, price range, or discount percentage (optional).
- As a logged in user, I want to be able to favourite games that I like, and view them on a page of favourite games (optional).

## Implementation

### Tech Stack

##### List technologies that will be used in your app, including any libraries to save time or provide more functionality. Be sure to research any potential limitations.

- React
- TypeScript
- MySQL
- Express
- Client libraries:
  - react
  - react-router
  - axios
- Server libraries:
  - knex
  - express
  - bcrypt for password hashing (maybe from 11-18 demo)
  -

### APIs

##### List any external sources of data that will be used in your app.

- No external APIs will be used for the first sprint

### Sitemap

##### List the pages of your app with brief descriptions. You can show this visually, or write it out.

#### Home page (List Games page)

![](home.jpg)

- Display results with game prices from different platforms (e.g., Steam, GOG).
- Search bar to enter game titles

#### Game Detail Page

![](game-details.jpg)

- Show detailed information about the game (e.g., description, release date).
- In a table below, list prices from supported platforms, with links to buy on each platform.
- Optionally show sale discounts and comparisons (within the table)

### Mockups

##### Provide visuals of your app's screens. You can use pictures of hand-drawn sketches, or wireframing tools like Figma.

### Data

##### Describe your data and the relationships between the data points. You can show this visually using diagrams, or write it out.

### Endpoints

##### List endpoints that your server will implement, including HTTP methods, parameters, and example responses.

## Roadmap

##### Scope your project as a sprint. Break down the tasks that will need to be completed and map out timeframes for implementation working back from the capstone due date.

---

## Future Implementations

##### Your project will be marked based on what you committed to in the above document. Here, you can list any additional features you may complete after the MVP of your application is built, or if you have extra time before the Capstone due date.
